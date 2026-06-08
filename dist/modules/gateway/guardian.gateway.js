"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GuardianGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardianGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const event_emitter_1 = require("@nestjs/event-emitter");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GuardianGateway = GuardianGateway_1 = class GuardianGateway {
    jwtService;
    prisma;
    server;
    logger = new common_1.Logger(GuardianGateway_1.name);
    parentSockets = new Map();
    deviceSockets = new Map();
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        try {
            const deviceIdQuery = client.handshake.query?.deviceId;
            const roleQuery = client.handshake.query?.role;
            if (roleQuery === 'DEVICE' && deviceIdQuery) {
                client.data.role = 'DEVICE';
                client.data.deviceId = deviceIdQuery;
                this.deviceSockets.set(deviceIdQuery, client.id);
                client.join(`device:${deviceIdQuery}`);
                await this.updateDeviceStatus(deviceIdQuery, 'ONLINE');
                this.logger.log(`Device connected: ${client.id} (Device ID: ${deviceIdQuery})`);
                return;
            }
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            if (payload.role === 'PARENT' || payload.role === 'ADMIN') {
                if (!this.parentSockets.has(payload.sub)) {
                    this.parentSockets.set(payload.sub, new Set());
                }
                this.parentSockets.get(payload.sub).add(client.id);
                client.join(`parent:${payload.sub}`);
            }
            this.logger.log(`Client connected: ${client.id} (${payload.role})`);
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.data?.role === 'DEVICE' && client.data?.deviceId) {
            const deviceId = client.data.deviceId;
            this.deviceSockets.delete(deviceId);
            await this.updateDeviceStatus(deviceId, 'OFFLINE');
            this.logger.log(`Device disconnected: ${client.id} (Device ID: ${deviceId})`);
            return;
        }
        const userId = client.data?.userId;
        if (userId && this.parentSockets.has(userId)) {
            this.parentSockets.get(userId).delete(client.id);
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async updateDeviceStatus(deviceId, status) {
        try {
            const device = await this.prisma.device.update({
                where: { deviceId },
                data: { status, lastSeen: new Date() },
            });
            this.server.to(`parent:${device.parentId}`).emit('device:status', {
                deviceId: device.id,
                status: status,
            });
        }
        catch (e) {
        }
    }
    handleSubscribeDevice(data, client) {
        client.join(`device:${data.deviceId}`);
        return { event: 'subscribed', deviceId: data.deviceId };
    }
    handlePingDevice(data, client) {
        this.server.to(`device:${data.deviceId}`).emit('force_sync');
        return { event: 'pinged', deviceId: data.deviceId };
    }
    handleSendDeviceMessage(data, client) {
        this.server.to(`device:${data.deviceId}`).emit('device:message', {
            type: data.type,
            message: data.message,
            password: data.password,
        });
        return { event: 'message_sent', deviceId: data.deviceId };
    }
    handleBatteryUpdate(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('battery:update', {
            deviceId: payload.deviceId,
            battery: payload.data,
        });
        this.server.to(`device:${payload.deviceId}`).emit('battery:update', {
            battery: payload.data,
        });
    }
    handleLocationUpdate(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('location:update', {
            deviceId: payload.deviceId,
            location: payload.data,
        });
    }
    handleNotificationReceived(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('notification:received', {
            deviceId: payload.deviceId,
            notification: payload.data,
        });
    }
    handleAppsSync(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('apps:synced', {
            deviceId: payload.deviceId,
            count: payload.count,
        });
    }
    handleUsageSync(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('usage:synced', {
            deviceId: payload.deviceId,
        });
    }
    handleDeviceStatus(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('device:status', {
            deviceId: payload.deviceId,
            status: payload.status,
        });
    }
    handleLowBattery(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('alert', {
            type: 'LOW_BATTERY',
            deviceId: payload.deviceId,
            message: `Battery is at ${payload.level}%`,
        });
    }
    handleDeviceDeleted(payload) {
        this.server.to(`device:${payload.deviceId}`).emit('device:deleted');
    }
    handleApprovalRequested(payload) {
        this.server.to(`parent:${payload.parentId}`).emit('approval:requested', {
            deviceId: payload.deviceId,
            data: payload.data,
        });
    }
    handleApprovalResolved(payload) {
        this.server.to(`device:${payload.deviceHardwareId}`).emit('approval:resolved', {
            packageName: payload.packageName,
            appName: payload.appName,
            status: payload.status,
        });
    }
    emitToParent(parentId, event, data) {
        this.server.to(`parent:${parentId}`).emit(event, data);
    }
};
exports.GuardianGateway = GuardianGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GuardianGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:device'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleSubscribeDevice", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping_device'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handlePingDevice", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_device_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleSendDeviceMessage", null);
__decorate([
    (0, event_emitter_1.OnEvent)('battery.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleBatteryUpdate", null);
__decorate([
    (0, event_emitter_1.OnEvent)('location.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleLocationUpdate", null);
__decorate([
    (0, event_emitter_1.OnEvent)('notification.received'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleNotificationReceived", null);
__decorate([
    (0, event_emitter_1.OnEvent)('apps.synced'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleAppsSync", null);
__decorate([
    (0, event_emitter_1.OnEvent)('usage.synced'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleUsageSync", null);
__decorate([
    (0, event_emitter_1.OnEvent)('device.status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleDeviceStatus", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.low_battery'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleLowBattery", null);
__decorate([
    (0, event_emitter_1.OnEvent)('device.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleDeviceDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('approval.requested'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleApprovalRequested", null);
__decorate([
    (0, event_emitter_1.OnEvent)('approval.resolved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuardianGateway.prototype, "handleApprovalResolved", null);
exports.GuardianGateway = GuardianGateway = GuardianGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/guardian',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], GuardianGateway);
//# sourceMappingURL=guardian.gateway.js.map