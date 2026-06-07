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
exports.AppsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let AppsService = class AppsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async syncApps(deviceId, dto) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const incomingPackages = new Set(dto.apps.map((a) => a.packageName));
        const upsertOps = dto.apps.map((app) => this.prisma.installedApp.upsert({
            where: { deviceId_packageName: { deviceId: device.id, packageName: app.packageName } },
            create: {
                deviceId: device.id,
                packageName: app.packageName,
                appName: app.appName,
                versionName: app.versionName,
                versionCode: app.versionCode,
                isSystemApp: app.isSystemApp ?? false,
                isActive: true,
                lastSeen: new Date(),
            },
            update: {
                appName: app.appName,
                versionName: app.versionName,
                versionCode: app.versionCode,
                isActive: true,
                lastSeen: new Date(),
            },
        }));
        const deleteOp = this.prisma.installedApp.deleteMany({
            where: {
                deviceId: device.id,
                packageName: { notIn: Array.from(incomingPackages) },
            },
        });
        const [results] = await this.prisma.$transaction([
            ...upsertOps,
            deleteOp,
        ]);
        this.eventEmitter.emit('apps.synced', {
            deviceId: device.id,
            parentId: device.parentId,
            count: dto.apps.length,
        });
        return { synced: dto.apps.length, message: 'Apps synced successfully' };
    }
    async getApps(deviceId, includeSystem = false) {
        return this.prisma.installedApp.findMany({
            where: {
                device: { deviceId },
                ...(includeSystem ? {} : { isSystemApp: false }),
            },
            orderBy: { appName: 'asc' },
        });
    }
    async syncUsage(deviceId, dto) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        for (const usage of dto.usages) {
            const app = await this.prisma.installedApp.findUnique({
                where: { deviceId_packageName: { deviceId: device.id, packageName: usage.packageName } },
            });
            if (!app)
                continue;
            const date = new Date(usage.date);
            date.setHours(0, 0, 0, 0);
            await this.prisma.appUsage.upsert({
                where: {
                    deviceId_packageName_date: {
                        deviceId: device.id,
                        packageName: usage.packageName,
                        date,
                    },
                },
                create: {
                    deviceId: device.id,
                    appId: app.id,
                    packageName: usage.packageName,
                    appName: usage.appName,
                    usageMs: usage.usageMs,
                    date,
                },
                update: { usageMs: usage.usageMs },
            });
        }
        this.eventEmitter.emit('usage.synced', {
            deviceId: device.id,
            parentId: device.parentId,
        });
        return { synced: dto.usages.length, message: 'Usage synced' };
    }
    async getUsage(deviceId, from, to) {
        const toDate = to ?? new Date();
        const fromDate = from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const usages = await this.prisma.appUsage.groupBy({
            by: ['packageName', 'appName'],
            where: {
                device: { deviceId },
                date: { gte: fromDate, lte: toDate },
            },
            _sum: { usageMs: true },
            orderBy: { _sum: { usageMs: 'desc' } },
            take: 20,
        });
        return usages.map((u) => ({
            packageName: u.packageName,
            appName: u.appName,
            totalUsageMs: Number(u._sum.usageMs ?? 0),
        }));
    }
    async getDailyUsage(deviceId, date) {
        const day = new Date(date);
        day.setHours(0, 0, 0, 0);
        return this.prisma.appUsage.findMany({
            where: { device: { deviceId }, date: day },
            orderBy: { usageMs: 'desc' },
        });
    }
};
exports.AppsService = AppsService;
exports.AppsService = AppsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AppsService);
//# sourceMappingURL=apps.service.js.map