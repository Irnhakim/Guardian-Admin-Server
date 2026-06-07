import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { DeviceStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class DevicesService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    register(dto: RegisterDeviceDto, parentId: string): Promise<{
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
    findAll(parentId: string): Promise<({
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
    findOne(id: string, parentId: string): Promise<{
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
    findByDeviceId(deviceId: string): Promise<{
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
    update(id: string, parentId: string, dto: UpdateDeviceDto): Promise<{
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
    updateStatus(deviceId: string, status: DeviceStatus): Promise<{
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
    heartbeat(deviceId: string): Promise<{
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
    delete(id: string, parentId: string): Promise<{
        message: string;
    }>;
}
