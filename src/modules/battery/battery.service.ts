import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatteryLogDto } from './dto/battery.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BatteryService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async log(deviceId: string, dto: BatteryLogDto) {
    // Verify device exists
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const log = await this.prisma.batteryLog.create({
      data: {
        deviceId: device.id,
        level: dto.level,
        isCharging: dto.isCharging,
        temperature: dto.temperature,
        voltage: dto.voltage,
      },
    });

    // Emit event for real-time WebSocket and alert processing
    this.eventEmitter.emit('battery.updated', {
      deviceId: device.id,
      parentId: device.parentId,
      data: log,
    });

    // Trigger low battery alert if below 20%
    if (dto.level <= 20 && !dto.isCharging) {
      this.eventEmitter.emit('alert.low_battery', {
        deviceId: device.id,
        parentId: device.parentId,
        level: dto.level,
      });
    }

    return log;
  }

  async getLatest(deviceId: string) {
    return this.prisma.batteryLog.findFirst({
      where: { device: { deviceId } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getHistory(deviceId: string, limit = 96) {
    // Last 96 readings = 24h at 15min intervals
    return this.prisma.batteryLog.findMany({
      where: { device: { deviceId } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
