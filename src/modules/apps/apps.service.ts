import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncAppsDto, SyncUsageDto } from './dto/apps.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async syncApps(deviceId: string, dto: SyncAppsDto) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const incomingPackages = new Set(dto.apps.map((a) => a.packageName));

    // Upsert all incoming apps
    const upsertOps = dto.apps.map((app) =>
      this.prisma.installedApp.upsert({
        where: { deviceId_packageName: { deviceId: device.id, packageName: app.packageName } },
        create: {
          deviceId: device.id,
          packageName: app.packageName,
          appName: app.appName,
          versionName: app.versionName,
          versionCode: app.versionCode,
          isSystemApp: app.isSystemApp ?? false,
          isActive: true,
          lastSeen: new Date(),
        },
        update: {
          appName: app.appName,
          versionName: app.versionName,
          versionCode: app.versionCode,
          isActive: true,
          lastSeen: new Date(),
        },
      }),
    );

    // Delete apps that are no longer installed on the device
    const deleteOp = this.prisma.installedApp.deleteMany({
      where: {
        deviceId: device.id,
        packageName: { notIn: Array.from(incomingPackages) },
      },
    });

    const [results] = await this.prisma.$transaction([
      ...upsertOps,
      deleteOp,
    ] as any);

    // Emit for real-time dashboard refresh
    this.eventEmitter.emit('apps.synced', {
      deviceId: device.id,
      parentId: device.parentId,
      count: dto.apps.length,
    });

    return { synced: dto.apps.length, message: 'Apps synced successfully' };
  }

  async getApps(deviceId: string, includeSystem = false) {
    return this.prisma.installedApp.findMany({
      where: {
        device: { deviceId },
        ...(includeSystem ? {} : { isSystemApp: false }),
      },
      orderBy: { appName: 'asc' },
    });
  }

  async syncUsage(deviceId: string, dto: SyncUsageDto) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    for (const usage of dto.usages) {
      const app = await this.prisma.installedApp.findUnique({
        where: { deviceId_packageName: { deviceId: device.id, packageName: usage.packageName } },
      });
      if (!app) continue;

      const date = new Date(usage.date);
      date.setHours(0, 0, 0, 0);

      await this.prisma.appUsage.upsert({
        where: {
          deviceId_packageName_date: {
            deviceId: device.id,
            packageName: usage.packageName,
            date,
          },
        },
        create: {
          deviceId: device.id,
          appId: app.id,
          packageName: usage.packageName,
          appName: usage.appName,
          usageMs: usage.usageMs,
          date,
        },
        update: { usageMs: usage.usageMs },
      });
    }

    this.eventEmitter.emit('usage.synced', {
      deviceId: device.id,
      parentId: device.parentId,
    });

    return { synced: dto.usages.length, message: 'Usage synced' };
  }

  async getUsage(deviceId: string, from?: Date, to?: Date) {
    const toDate = to ?? new Date();
    const fromDate = from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const usages = await this.prisma.appUsage.groupBy({
      by: ['packageName', 'appName'],
      where: {
        device: { deviceId },
        date: { gte: fromDate, lte: toDate },
      },
      _sum: { usageMs: true },
      orderBy: { _sum: { usageMs: 'desc' } },
      take: 20,
    });

    return usages.map((u) => ({
      packageName: u.packageName,
      appName: u.appName,
      totalUsageMs: Number(u._sum.usageMs ?? 0),
    }));
  }

  async getDailyUsage(deviceId: string, date: string) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    return this.prisma.appUsage.findMany({
      where: { device: { deviceId }, date: day },
      orderBy: { usageMs: 'desc' },
    });
  }
}
