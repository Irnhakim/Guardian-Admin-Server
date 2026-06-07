import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async log(deviceId: string, dto: CreateNotificationDto) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const notification = await this.prisma.appNotification.create({
      data: {
        deviceId: device.id,
        packageName: dto.packageName,
        appName: dto.appName,
        title: dto.title,
        text: dto.text,
        category: dto.category,
      },
    });

    // Emit event for real-time WebSocket and parent updates
    this.eventEmitter.emit('notification.received', {
      deviceId: device.id,
      parentId: device.parentId,
      data: notification,
    });

    return notification;
  }

  async getHistory(deviceId: string, limit = 50) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.appNotification.findMany({
      where: { deviceId: device.id },
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });
  }
}
