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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let NotificationsService = class NotificationsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async log(deviceId, dto) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const notification = await this.prisma.appNotification.create({
            data: {
                deviceId: device.id,
                packageName: dto.packageName,
                appName: dto.appName,
                title: dto.title,
                text: dto.text,
                category: dto.category,
            },
        });
        this.eventEmitter.emit('notification.received', {
            deviceId: device.id,
            parentId: device.parentId,
            data: notification,
        });
        return notification;
    }
    async getHistory(deviceId, limit = 50) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return this.prisma.appNotification.findMany({
            where: { deviceId: device.id },
            orderBy: { receivedAt: 'desc' },
            take: limit,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map