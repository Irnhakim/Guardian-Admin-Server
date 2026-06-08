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
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let ApprovalsService = class ApprovalsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(deviceId, dto) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const approval = await this.prisma.appApproval.upsert({
            where: {
                deviceId_packageName: {
                    deviceId: device.id,
                    packageName: dto.packageName,
                },
            },
            create: {
                deviceId: device.id,
                packageName: dto.packageName,
                appName: dto.appName,
                installer: dto.installer,
                status: 'PENDING',
            },
            update: {
                appName: dto.appName,
                installer: dto.installer,
                status: 'PENDING',
                requestedAt: new Date(),
                resolvedAt: null,
            },
        });
        this.eventEmitter.emit('approval.requested', {
            deviceId: device.id,
            parentId: device.parentId,
            data: approval,
        });
        return approval;
    }
    async getHistory(deviceId) {
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return this.prisma.appApproval.findMany({
            where: { deviceId: device.id },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async resolve(id, parentId, dto) {
        const approval = await this.prisma.appApproval.findUnique({
            where: { id },
            include: { device: true },
        });
        if (!approval)
            throw new common_1.NotFoundException('Approval request not found');
        if (approval.device.parentId !== parentId) {
            throw new common_1.ForbiddenException('You do not have permission to manage this device');
        }
        const updated = await this.prisma.appApproval.update({
            where: { id },
            data: {
                status: dto.status,
                resolvedAt: new Date(),
            },
        });
        this.eventEmitter.emit('approval.resolved', {
            deviceId: approval.device.id,
            deviceHardwareId: approval.device.deviceId,
            packageName: approval.packageName,
            appName: approval.appName,
            status: dto.status,
        });
        return updated;
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map