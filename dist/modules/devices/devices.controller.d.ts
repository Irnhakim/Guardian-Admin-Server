import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    register(dto: RegisterDeviceDto, req: any): Promise<{
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
    }>;
    findAll(req: any): Promise<({
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
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
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
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
    }>;
    update(id: string, req: any, dto: UpdateDeviceDto): Promise<{
        id: string;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
        fcmToken: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
}
