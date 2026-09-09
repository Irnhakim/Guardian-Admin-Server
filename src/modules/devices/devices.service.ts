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

  async addBrowsingHistory(deviceId: string, dto: { url: string; title?: string; browser?: string }) {
    const device = await this.findByDeviceId(deviceId);
    if (!device) return null;

    // Deduplicate: abaikan kalau URL sama persis dalam 10 detik terakhir
    const recent = await this.prisma.browsingHistory.findFirst({
      where: {
        deviceId: device.id,
        url: dto.url,
        visitedAt: { gte: new Date(Date.now() - 10000) },
      },
    });
    if (recent) return recent;

    const log = await this.prisma.browsingHistory.create({
      data: {
        deviceId: device.id,
        url: dto.url,
        title: dto.title,
        browser: dto.browser,
      },
    });

    this.eventEmitter.emit('browsing.created', { deviceId: device.id, data: log });
    return log;
  }

  async getBrowsingHistory(deviceId: string, limit = 100) {
    const device = await this.findOne(deviceId);
    return this.prisma.browsingHistory.findMany({
      where: { deviceId: device.id },
      orderBy: { visitedAt: 'desc' },
      take: limit,
    });
  }

  async saveCapture(deviceId: string, dto: { cameraType: string; base64Image: string }) {
    const device = await this.findByDeviceId(deviceId);
    if (!device) return null;

    const fs = await import('fs/promises');
    const path = await import('path');

    const cleanBase64 = dto.base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const fileName = `capture_${device.id}_${Date.now()}.jpg`;
    const targetDir = path.join(process.cwd(), 'uploads', 'captures');
    await fs.mkdir(targetDir, { recursive: true });
    const fullPath = path.join(targetDir, fileName);
    await fs.writeFile(fullPath, buffer);

    const relativeUrl = `/uploads/captures/${fileName}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capture = await (this.prisma as any).deviceCapture.create({
      data: {
        deviceId: device.id,
        cameraType: dto.cameraType || 'BACK',
        filePath: relativeUrl,
      },
    });

    this.eventEmitter.emit('capture.created', { deviceId: device.id, data: capture });
    return capture;
  }

  async getCaptures(deviceId: string, limit = 50) {
    const device = await this.findOne(deviceId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).deviceCapture.findMany({
      where: { deviceId: device.id },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  }

  async clearBrowsingHistory(deviceId: string) {
    const device = await this.findOne(deviceId);
    await (this.prisma as any).browsingHistory.deleteMany({
      where: { deviceId: device.id },
    });
    return { message: 'Browsing history deleted' };
  }

  async clearCaptures(deviceId: string) {
    const device = await this.findOne(deviceId);
    const fs = await import('fs/promises');
    const path = await import('path');

    const captures = await (this.prisma as any).deviceCapture.findMany({
      where: { deviceId: device.id },
    });

    for (const item of captures) {
      if (item.filePath) {
        try {
          const absolutePath = path.join(process.cwd(), item.filePath);
          await fs.unlink(absolutePath);
        } catch {
          // Ignore missing files
        }
      }
    }

    await (this.prisma as any).deviceCapture.deleteMany({
      where: { deviceId: device.id },
    });
    return { message: 'Captures deleted' };
  }

  async deleteCapture(deviceId: string, captureId: string) {
    const device = await this.findOne(deviceId);
    const fs = await import('fs/promises');
    const path = await import('path');

    const capture = await (this.prisma as any).deviceCapture.findFirst({
      where: { id: captureId, deviceId: device.id },
    });

    if (capture?.filePath) {
      try {
        const absolutePath = path.join(process.cwd(), capture.filePath);
        await fs.unlink(absolutePath);
      } catch {
        // Ignore missing files
      }
    }

    await (this.prisma as any).deviceCapture.deleteMany({
      where: { id: captureId, deviceId: device.id },
    });
    return { message: 'Capture deleted' };
  }
}
