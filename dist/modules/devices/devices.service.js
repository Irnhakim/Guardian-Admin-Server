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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const event_emitter_1 = require("@nestjs/event-emitter");
let DevicesService = class DevicesService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async register(dto, parentId) {
        const existing = await this.prisma.device.findUnique({
            where: { deviceId: dto.deviceId },
        });
        if (existing) {
            const device = await this.prisma.device.update({
                where: { deviceId: dto.deviceId },
                data: {
                    deviceName: dto.deviceName,
                    brand: dto.brand,
                    model: dto.model,
                    androidVersion: dto.androidVersion,
                    securityPatch: dto.securityPatch,
                    fcmToken: dto.fcmToken,
                    status: client_1.DeviceStatus.ONLINE,
                    lastSeen: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.eventEmitter.emit('device.status', {
                deviceId: device.id,
                parentId: device.parentId,
                status: 'ONLINE',
            });
            return device;
        }
        const device = await this.prisma.device.create({
            data: {
                deviceId: dto.deviceId,
                deviceName: dto.deviceName,
                brand: dto.brand,
                model: dto.model,
                androidVersion: dto.androidVersion,
                securityPatch: dto.securityPatch,
                fcmToken: dto.fcmToken,
                parentId,
                status: client_1.DeviceStatus.ONLINE,
                lastSeen: new Date(),
            },
        });
        this.eventEmitter.emit('device.status', {
            deviceId: device.id,
            parentId: device.parentId,
            status: 'ONLINE',
        });
        return device;
    }
    async findAll(parentId) {
        const devices = await this.prisma.device.findMany({
            where: { parentId },
            include: {
                _count: {
                    select: {
                        installedApps: true,
                        alerts: { where: { isRead: false } },
                    },
                },
            },
            orderBy: { lastSeen: 'desc' },
        });
        const now = new Date();
        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
        const updatedDevices = await Promise.all(devices.map(async (device) => {
            if (device.status === client_1.DeviceStatus.ONLINE &&
                device.lastSeen &&
                device.lastSeen < threeMinutesAgo) {
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { status: client_1.DeviceStatus.OFFLINE },
                });
                this.eventEmitter.emit('device.status', {
                    deviceId: device.id,
                    parentId: device.parentId,
                    status: 'OFFLINE',
                });
                return { ...device, status: client_1.DeviceStatus.OFFLINE };
            }
            return device;
        }));
        return updatedDevices;
    }
    async findOne(id, parentId) {
        const device = await this.prisma.device.findFirst({
            where: { id, parentId },
            include: {
                _count: {
                    select: {
                        installedApps: { where: { isActive: true } },
                        alerts: { where: { isRead: false } },
                    },
                },
            },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const now = new Date();
        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
        if (device.status === client_1.DeviceStatus.ONLINE &&
            device.lastSeen &&
            device.lastSeen < threeMinutesAgo) {
            await this.prisma.device.update({
                where: { id: device.id },
                data: { status: client_1.DeviceStatus.OFFLINE },
            });
            this.eventEmitter.emit('device.status', {
                deviceId: device.id,
                parentId: device.parentId,
                status: 'OFFLINE',
            });
            return { ...device, status: client_1.DeviceStatus.OFFLINE };
        }
        return device;
    }
    async findByDeviceId(deviceId) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return device;
    }
    async update(id, parentId, dto) {
        await this.findOne(id, parentId);
        return this.prisma.device.update({ where: { id }, data: dto });
    }
    async updateStatus(deviceId, status) {
        return this.prisma.device.update({
            where: { deviceId },
            data: { status, lastSeen: new Date() },
        });
    }
    async heartbeat(deviceId) {
        return this.prisma.device.update({
            where: { deviceId },
            data: { status: client_1.DeviceStatus.ONLINE, lastSeen: new Date() },
        });
    }
    async delete(id, parentId) {
        await this.findOne(id, parentId);
        await this.prisma.device.delete({ where: { id } });
        return { message: 'Device removed' };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], DevicesService);
//# sourceMappingURL=devices.service.js.map