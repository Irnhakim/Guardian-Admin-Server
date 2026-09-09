import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto, CreateBrowsingHistoryDto, CreateCaptureDto } from './dto/device.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    register(dto: RegisterDeviceDto): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        batteryLogs: {
            deviceId: string;
            id: string;
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
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            installedApps: number;
            alerts: number;
        };
    } & {
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateDeviceDto): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    addBrowsing(deviceId: string, dto: CreateBrowsingHistoryDto): Promise<{
        title: string | null;
        deviceId: string;
        url: string;
        browser: string | null;
        id: string;
        visitedAt: Date;
    } | null>;
    getBrowsing(id: string): Promise<{
        title: string | null;
        deviceId: string;
        url: string;
        browser: string | null;
        id: string;
        visitedAt: Date;
    }[]>;
    clearBrowsing(id: string): Promise<{
        message: string;
    }>;
    addCapture(deviceId: string, dto: CreateCaptureDto): Promise<any>;
    getCaptures(id: string): Promise<any>;
    clearCaptures(id: string): Promise<{
        message: string;
    }>;
    deleteCapture(id: string, captureId: string): Promise<{
        message: string;
    }>;
}
