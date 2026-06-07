import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    register(dto: RegisterDeviceDto, req: any): Promise<{
        id: string;
        updatedAt: Date;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
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
        updatedAt: Date;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
    })[]>;
    findOne(id: string, req: any): Promise<{
        _count: {
            installedApps: number;
            alerts: number;
        };
    } & {
        id: string;
        updatedAt: Date;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
    }>;
    update(id: string, req: any, dto: UpdateDeviceDto): Promise<{
        id: string;
        updatedAt: Date;
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        parentId: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
}
