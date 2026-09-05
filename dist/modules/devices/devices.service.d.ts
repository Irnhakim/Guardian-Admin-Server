import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { DeviceStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class DevicesService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    register(dto: RegisterDeviceDto): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
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
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    findByDeviceId(deviceId: string): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
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
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(deviceId: string, status: DeviceStatus): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    heartbeat(deviceId: string): Promise<{
        deviceId: string;
        deviceName: string;
        brand: string;
        model: string;
        androidVersion: string;
        securityPatch: string | null;
        fcmToken: string | null;
        id: string;
        status: import("@prisma/client").$Enums.DeviceStatus;
        lastSeen: Date | null;
        registeredAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
