import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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

  async register(dto: RegisterDeviceDto, parentId: string) {
    const existing = await this.prisma.device.findUnique({
      where: { deviceId: dto.deviceId },
    });
    if (existing) {
      // Update and return if already registered (re-registration)
      const device = await this.prisma.device.update({
        where: { deviceId: dto.deviceId },
        data: {
          deviceName: dto.deviceName,
          brand: dto.brand,
          model: dto.model,
          androidVersion: dto.androidVersion,
          securityPatch: dto.securityPatch,
          fcmToken: dto.fcmToken,
          status: DeviceStatus.ONLINE,
          lastSeen: new Date(),
          updatedAt: new Date(),
        },
      });

      this.eventEmitter.emit('device.status', {
        deviceId: device.id,
        parentId: device.parentId,
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
        parentId,
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    });

    this.eventEmitter.emit('device.status', {
      deviceId: device.id,
      parentId: device.parentId,
      status: 'ONLINE',
    });

    return device;
  }

  async findAll(parentId: string) {
    const devices = await this.prisma.device.findMany({
      where: { parentId },
      include: {
        _count: {
          select: {
            installedApps: true,
            alerts: { where: { isRead: false } },
          },
        },
      },
      orderBy: { lastSeen: 'desc' },
    });

    const now = new Date();
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    const updatedDevices = await Promise.all(
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
            parentId: device.parentId,
            status: 'OFFLINE',
          });

          return { ...device, status: DeviceStatus.OFFLINE };
        }
        return device;
      }),
    );

    return updatedDevices;
  }

  async findOne(id: string, parentId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id, parentId },
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
        parentId: device.parentId,
        status: 'OFFLINE',
      });

      return { ...device, status: DeviceStatus.OFFLINE };
    }

    return device;
  }

  async findByDeviceId(deviceId: string) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async update(id: string, parentId: string, dto: UpdateDeviceDto) {
    await this.findOne(id, parentId);
    return this.prisma.device.update({ where: { id }, data: dto });
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

  async delete(id: string, parentId: string) {
    await this.findOne(id, parentId);
    await this.prisma.device.delete({ where: { id } });
    return { message: 'Device removed' };
  }
}
