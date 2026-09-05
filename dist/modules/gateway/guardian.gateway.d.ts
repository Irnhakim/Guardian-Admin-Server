import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
export declare class GuardianGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    server: Server;
    private readonly logger;
    private deviceSockets;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    private updateDeviceStatus;
    handleSubscribeDevice(data: {
        deviceId: string;
    }, client: Socket): {
        event: string;
        deviceId: string;
    };
    handlePingDevice(data: {
        deviceId: string;
    }): {
        event: string;
        deviceId: string;
    };
    handleSendDeviceMessage(data: {
        deviceId: string;
        type: 'MESSAGE' | 'BLOCK';
        message: string;
        password?: string;
    }): {
        event: string;
        deviceId: string;
    };
    handleHideApp(data: {
        deviceId: string;
    }): {
        event: string;
        deviceId: string;
    };
    handleShowApp(data: {
        deviceId: string;
    }): {
        event: string;
        deviceId: string;
    };
    handleBatteryUpdate(payload: {
        deviceId: string;
        data: any;
    }): void;
    handleLocationUpdate(payload: {
        deviceId: string;
        data: any;
    }): void;
    handleNotificationReceived(payload: {
        deviceId: string;
        data: any;
    }): void;
    handleAppsSync(payload: {
        deviceId: string;
        count: number;
    }): void;
    handleUsageSync(payload: {
        deviceId: string;
    }): void;
    handleDeviceStatus(payload: {
        deviceId: string;
        status: string;
    }): void;
    handleLowBattery(payload: {
        deviceId: string;
        level: number;
    }): void;
    handleDeviceDeleted(payload: {
        deviceId: string;
    }): void;
    handleApprovalRequested(payload: {
        deviceId: string;
        data: any;
    }): void;
    handleApprovalResolved(payload: {
        deviceId: string;
        deviceHardwareId: string;
        packageName: string;
        appName: string;
        status: string;
    }): void;
}
