import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeviceStatus } from '@prisma/client';

@Injectable()
export class DeviceActivityInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.params?.deviceId;

    return next.handle().pipe(
      tap(async () => {
        if (deviceId) {
          try {
            // Update device status to ONLINE and lastSeen to current time
            const device = await this.prisma.device.update({
              where: { deviceId },
              data: {
                status: DeviceStatus.ONLINE,
                lastSeen: new Date(),
              },
            });

            // Emit the status update event for WebSockets
            this.eventEmitter.emit('device.status', {
              deviceId: device.id,
              parentId: device.parentId,
              status: 'ONLINE',
            });
          } catch (error) {
            // Silently ignore if device is not found or other db error (so it doesn't break API response)
          }
        }
      }),
    );
  }
}
