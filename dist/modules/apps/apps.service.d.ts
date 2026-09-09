import { PrismaService } from '../../prisma/prisma.service';
import { SyncAppsDto, SyncUsageDto } from './dto/apps.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AppsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    syncApps(deviceId: string, dto: SyncAppsDto): Promise<{
        synced: number;
        message: string;
    }>;
    getApps(deviceId: string, includeSystem?: boolean): Promise<{
        deviceId: string;
        id: string;
        lastSeen: Date;
        updatedAt: Date;
        isActive: boolean;
        packageName: string;
        appName: string;
        versionName: string | null;
        versionCode: number | null;
        isSystemApp: boolean;
        installedAt: Date | null;
        firstSeen: Date;
    }[]>;
    syncUsage(deviceId: string, dto: SyncUsageDto): Promise<{
        synced: number;
        message: string;
    }>;
    getUsage(deviceId: string, from?: Date, to?: Date): Promise<{
        packageName: string;
        appName: string;
        totalUsageMs: number;
    }[]>;
    getDailyUsage(deviceId: string, date: string): Promise<{
        deviceId: string;
        id: string;
        updatedAt: Date;
        packageName: string;
        appName: string;
        usageMs: bigint;
        date: Date;
        appId: string;
        createdAt: Date;
    }[]>;
}
