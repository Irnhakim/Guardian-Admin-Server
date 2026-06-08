import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class GuardianGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    private readonly logger;
    private parentSockets;
    private deviceSockets;
    constructor(jwtService: JwtService, prisma: PrismaService);
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
    }, client: Socket): {
        event: string;
        deviceId: string;
    };
    handleSendDeviceMessage(data: {
        deviceId: string;
        type: 'MESSAGE' | 'BLOCK';
        message: string;
        password?: string;
    }, client: Socket): {
        event: string;
        deviceId: string;
    };
    handleBatteryUpdate(payload: {
        deviceId: string;
        parentId: string;
        data: any;
    }): void;
    handleLocationUpdate(payload: {
        deviceId: string;
        parentId: string;
        data: any;
    }): void;
    handleNotificationReceived(payload: {
        deviceId: string;
        parentId: string;
        data: any;
    }): void;
    handleAppsSync(payload: {
        deviceId: string;
        parentId: string;
        count: number;
    }): void;
    handleUsageSync(payload: {
        deviceId: string;
        parentId: string;
    }): void;
    handleDeviceStatus(payload: {
        deviceId: string;
        parentId: string;
        status: string;
    }): void;
    handleLowBattery(payload: {
        deviceId: string;
        parentId: string;
        level: number;
    }): void;
    handleDeviceDeleted(payload: {
        deviceId: string;
    }): void;
    handleApprovalRequested(payload: {
        deviceId: string;
        parentId: string;
        data: any;
    }): void;
    handleApprovalResolved(payload: {
        deviceId: string;
        deviceHardwareId: string;
        packageName: string;
        appName: string;
        status: string;
    }): void;
    emitToParent(parentId: string, event: string, data: any): void;
}
