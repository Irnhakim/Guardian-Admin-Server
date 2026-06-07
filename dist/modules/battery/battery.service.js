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
exports.BatteryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let BatteryService = class BatteryService {
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
        let log = await this.prisma.batteryLog.findFirst({
            where: { deviceId: device.id },
        });
        if (log) {
            log = await this.prisma.batteryLog.update({
                where: { id: log.id },
                data: {
                    level: dto.level,
                    isCharging: dto.isCharging,
                    temperature: dto.temperature,
                    voltage: dto.voltage,
                    timestamp: new Date(),
                },
            });
        }
        else {
            log = await this.prisma.batteryLog.create({
                data: {
                    deviceId: device.id,
                    level: dto.level,
                    isCharging: dto.isCharging,
                    temperature: dto.temperature,
                    voltage: dto.voltage,
                },
            });
        }
        this.eventEmitter.emit('battery.updated', {
            deviceId: device.id,
            parentId: device.parentId,
            data: log,
        });
        if (dto.level <= 20 && !dto.isCharging) {
            this.eventEmitter.emit('alert.low_battery', {
                deviceId: device.id,
                parentId: device.parentId,
                level: dto.level,
            });
        }
        return log;
    }
    async getLatest(deviceId) {
        return this.prisma.batteryLog.findFirst({
            where: { device: { deviceId } },
            orderBy: { timestamp: 'desc' },
        });
    }
    async getHistory(deviceId, limit = 96) {
        return this.prisma.batteryLog.findMany({
            where: { device: { deviceId } },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
};
exports.BatteryService = BatteryService;
exports.BatteryService = BatteryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], BatteryService);
//# sourceMappingURL=battery.service.js.map