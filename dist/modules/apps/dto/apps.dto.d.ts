export declare class AppInfoDto {
    packageName: string;
    appName: string;
    versionName?: string;
    versionCode?: number;
    isSystemApp?: boolean;
}
export declare class SyncAppsDto {
    apps: AppInfoDto[];
}
export declare class AppUsageDto {
    packageName: string;
    appName: string;
    usageMs: number;
    date: string;
}
export declare class SyncUsageDto {
    usages: AppUsageDto[];
}
