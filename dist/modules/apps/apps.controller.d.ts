import { AppsService } from './apps.service';
import { SyncAppsDto, SyncUsageDto } from './dto/apps.dto';
export declare class AppsController {
    private appsService;
    constructor(appsService: AppsService);
    syncApps(deviceId: string, dto: SyncAppsDto): Promise<{
        synced: number;
        message: string;
    }>;
    getApps(deviceId: string, includeSystem?: string): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        deviceId: string;
        lastSeen: Date;
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
    getUsage(deviceId: string, from?: string, to?: string): Promise<{
        packageName: string;
        appName: string;
        totalUsageMs: number;
    }[]>;
    getDailyUsage(deviceId: string, date: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        packageName: string;
        appName: string;
        usageMs: bigint;
        date: Date;
        appId: string;
    }[]>;
}
