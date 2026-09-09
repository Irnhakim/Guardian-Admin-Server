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
    async register(dto) {
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
                    permissions: dto.permissions !== undefined ? dto.permissions : undefined,
                    status: client_1.DeviceStatus.ONLINE,
                    lastSeen: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.eventEmitter.emit('device.status', {
                deviceId: device.id,
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
                permissions: dto.permissions !== undefined ? dto.permissions : undefined,
                status: client_1.DeviceStatus.ONLINE,
                lastSeen: new Date(),
            },
        });
        this.eventEmitter.emit('device.status', {
            deviceId: device.id,
            status: 'ONLINE',
        });
        return device;
    }
    async findAll() {
        const devices = await this.prisma.device.findMany({
            include: {
                _count: {
                    select: {
                        installedApps: true,
                        alerts: { where: { isRead: false } },
                    },
                },
                batteryLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
            orderBy: { lastSeen: 'desc' },
        });
        const now = new Date();
        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
        return Promise.all(devices.map(async (device) => {
            if (device.status === client_1.DeviceStatus.ONLINE &&
                device.lastSeen &&
                device.lastSeen < threeMinutesAgo) {
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { status: client_1.DeviceStatus.OFFLINE },
                });
                this.eventEmitter.emit('device.status', {
                    deviceId: device.id,
                    status: 'OFFLINE',
                });
                return { ...device, status: client_1.DeviceStatus.OFFLINE };
            }
            return device;
        }));
    }
    async findOne(id) {
        const device = await this.prisma.device.findFirst({
            where: {
                OR: [{ id }, { deviceId: id }],
            },
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
                status: 'OFFLINE',
            });
            return { ...device, status: client_1.DeviceStatus.OFFLINE };
        }
        return device;
    }
    async findByDeviceId(deviceId) {
        const device = await this.prisma.device.findFirst({
            where: {
                OR: [{ deviceId }, { id: deviceId }],
            },
        });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return device;
    }
    async update(id, dto) {
        const device = await this.findOne(id);
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                ...dto,
                permissions: dto.permissions !== undefined ? dto.permissions : undefined,
            },
        });
        if (dto.permissions) {
            this.eventEmitter.emit('device.permissions', {
                deviceId: device.id,
                permissions: dto.permissions,
            });
        }
        return updated;
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
    async delete(id) {
        const device = await this.findOne(id);
        this.eventEmitter.emit('device.deleted', { deviceId: device.deviceId });
        await this.prisma.device.delete({ where: { id: device.id } });
        return { message: 'Device removed' };
    }
    async addBrowsingHistory(deviceId, dto) {
        const device = await this.findByDeviceId(deviceId);
        if (!device)
            return null;
        const recent = await this.prisma.browsingHistory.findFirst({
            where: {
                deviceId: device.id,
                url: dto.url,
                visitedAt: { gte: new Date(Date.now() - 10000) },
            },
        });
        if (recent)
            return recent;
        const log = await this.prisma.browsingHistory.create({
            data: {
                deviceId: device.id,
                url: dto.url,
                title: dto.title,
                browser: dto.browser,
            },
        });
        this.eventEmitter.emit('browsing.created', { deviceId: device.id, data: log });
        return log;
    }
    async getBrowsingHistory(deviceId, limit = 100) {
        const device = await this.findOne(deviceId);
        return this.prisma.browsingHistory.findMany({
            where: { deviceId: device.id },
            orderBy: { visitedAt: 'desc' },
            take: limit,
        });
    }
    async saveCapture(deviceId, dto) {
        const device = await this.findByDeviceId(deviceId);
        if (!device)
            return null;
        const fs = await import('fs/promises');
        const path = await import('path');
        const cleanBase64 = dto.base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        const fileName = `capture_${device.id}_${Date.now()}.jpg`;
        const targetDir = path.join(process.cwd(), 'uploads', 'captures');
        await fs.mkdir(targetDir, { recursive: true });
        const fullPath = path.join(targetDir, fileName);
        await fs.writeFile(fullPath, buffer);
        const relativeUrl = `/uploads/captures/${fileName}`;
        const capture = await this.prisma.deviceCapture.create({
            data: {
                deviceId: device.id,
                cameraType: dto.cameraType || 'BACK',
                filePath: relativeUrl,
            },
        });
        this.eventEmitter.emit('capture.created', { deviceId: device.id, data: capture });
        return capture;
    }
    async getCaptures(deviceId, limit = 50) {
        const device = await this.findOne(deviceId);
        return this.prisma.deviceCapture.findMany({
            where: { deviceId: device.id },
            orderBy: { capturedAt: 'desc' },
            take: limit,
        });
    }
    async clearBrowsingHistory(deviceId) {
        const device = await this.findOne(deviceId);
        await this.prisma.browsingHistory.deleteMany({
            where: { deviceId: device.id },
        });
        return { message: 'Browsing history deleted' };
    }
    async clearCaptures(deviceId) {
        const device = await this.findOne(deviceId);
        const fs = await import('fs/promises');
        const path = await import('path');
        const captures = await this.prisma.deviceCapture.findMany({
            where: { deviceId: device.id },
        });
        for (const item of captures) {
            if (item.filePath) {
                try {
                    const absolutePath = path.join(process.cwd(), item.filePath);
                    await fs.unlink(absolutePath);
                }
                catch {
                }
            }
        }
        await this.prisma.deviceCapture.deleteMany({
            where: { deviceId: device.id },
        });
        return { message: 'Captures deleted' };
    }
    async deleteCapture(deviceId, captureId) {
        const device = await this.findOne(deviceId);
        const fs = await import('fs/promises');
        const path = await import('path');
        const capture = await this.prisma.deviceCapture.findFirst({
            where: { id: captureId, deviceId: device.id },
        });
        if (capture?.filePath) {
            try {
                const absolutePath = path.join(process.cwd(), capture.filePath);
                await fs.unlink(absolutePath);
            }
            catch {
            }
        }
        await this.prisma.deviceCapture.deleteMany({
            where: { id: captureId, deviceId: device.id },
        });
        return { message: 'Capture deleted' };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], DevicesService);
//# sourceMappingURL=devices.service.js.map