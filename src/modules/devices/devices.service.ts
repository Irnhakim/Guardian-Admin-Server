import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { DeviceStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDeviceDto) {
    const existing = await this.prisma.device.findUnique({
      where: { deviceId: dto.deviceId },
    });
    if (existing) {
      const device = await this.prisma.device.update({
        where: { deviceId: dto.deviceId },
        data: {
          deviceName: dto.deviceName,
          brand: dto.brand,
          model: dto.model,
          androidVersion: dto.androidVersion,
          securityPatch: dto.securityPatch,
          fcmToken: dto.fcmToken,
          permissions: dto.permissions !== undefined ? (dto.permissions as any) : undefined,
          status: DeviceStatus.ONLINE,
          lastSeen: new Date(),
          updatedAt: new Date(),
        },
      });

      this.eventEmitter.emit('device.status', {
        deviceId: device.id,
        status: 'ONLINE',
      });

      return device;
    }

    const device = await this.prisma.device.create({
      data: {
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
        brand: dto.brand,
        model: dto.model,
        androidVersion: dto.androidVersion,
        securityPatch: dto.securityPatch,
        fcmToken: dto.fcmToken,
        permissions: dto.permissions !== undefined ? (dto.permissions as any) : undefined,
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    });

    this.eventEmitter.emit('device.status', {
      deviceId: device.id,
      status: 'ONLINE',
    });

    return device;
  }

  async findAll() {
    const devices = await this.prisma.device.findMany({
      include: {
        _count: {
          select: {
            installedApps: true,
            alerts: { where: { isRead: false } },
          },
        },
        batteryLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastSeen: 'desc' },
    });

    const now = new Date();
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    return Promise.all(
      devices.map(async (device) => {
        if (
          device.status === DeviceStatus.ONLINE &&
          device.lastSeen &&
          device.lastSeen < threeMinutesAgo
        ) {
          await this.prisma.device.update({
            where: { id: device.id },
            data: { status: DeviceStatus.OFFLINE },
          });

          this.eventEmitter.emit('device.status', {
            deviceId: device.id,
            status: 'OFFLINE',
          });

          return { ...device, status: DeviceStatus.OFFLINE };
        }
        return device;
      }),
    );
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        OR: [{ id }, { deviceId: id }],
      },
      include: {
        _count: {
          select: {
            installedApps: { where: { isActive: true } },
            alerts: { where: { isRead: false } },
          },
        },
      },
    });
    if (!device) throw new NotFoundException('Device not found');

    const now = new Date();
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    if (
      device.status === DeviceStatus.ONLINE &&
      device.lastSeen &&
      device.lastSeen < threeMinutesAgo
    ) {
      await this.prisma.device.update({
        where: { id: device.id },
        data: { status: DeviceStatus.OFFLINE },
      });

      this.eventEmitter.emit('device.status', {
        deviceId: device.id,
        status: 'OFFLINE',
      });

      return { ...device, status: DeviceStatus.OFFLINE };
    }

    return device;
  }

  async findByDeviceId(deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        OR: [{ deviceId }, { id: deviceId }],
      },
    });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async update(id: string, dto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        ...dto,
        permissions: dto.permissions !== undefined ? (dto.permissions as any) : undefined,
      },
    });

    if (dto.permissions) {
      this.eventEmitter.emit('device.permissions', {
        deviceId: device.id,
        permissions: dto.permissions,
      });
    }

    return updated;
  }

  async updateStatus(deviceId: string, status: DeviceStatus) {
    return this.prisma.device.update({
      where: { deviceId },
      data: { status, lastSeen: new Date() },
    });
  }

  async heartbeat(deviceId: string) {
    return this.prisma.device.update({
      where: { deviceId },
      data: { status: DeviceStatus.ONLINE, lastSeen: new Date() },
    });
  }

  async delete(id: string) {
    const device = await this.findOne(id);
    this.eventEmitter.emit('device.deleted', { deviceId: device.deviceId });
    await this.prisma.device.delete({ where: { id: device.id } });
    return { message: 'Device removed' };
  }
}
