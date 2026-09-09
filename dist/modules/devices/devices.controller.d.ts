import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto, CreateBrowsingHistoryDto } from './dto/device.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    register(dto: RegisterDeviceDto): Promise<{
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        batteryLogs: {
            id: string;
            deviceId: string;
            timestamp: Date;
            level: number;
            isCharging: boolean;
            temperature: number | null;
            voltage: number | null;
        }[];
        _count: {
            installedApps: number;
            alerts: number;
        };
    } & {
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            installedApps: number;
            alerts: number;
        };
    } & {
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, dto: UpdateDeviceDto): Promise<{
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    addBrowsing(deviceId: string, dto: CreateBrowsingHistoryDto): Promise<{
        id: string;
        deviceId: string;
        url: string;
        title: string | null;
        browser: string | null;
        visitedAt: Date;
    } | null>;
    getBrowsing(id: string): Promise<{
        id: string;
        deviceId: string;
        url: string;
        title: string | null;
        browser: string | null;
        visitedAt: Date;
    }[]>;
}
