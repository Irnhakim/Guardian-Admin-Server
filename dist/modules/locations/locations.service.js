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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let LocationsService = class LocationsService {
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
        let location = await this.prisma.location.findFirst({
            where: { deviceId: device.id },
        });
        if (location) {
            location = await this.prisma.location.update({
                where: { id: location.id },
                data: {
                    latitude: dto.latitude,
                    longitude: dto.longitude,
                    accuracy: dto.accuracy,
                    altitude: dto.altitude,
                    speed: dto.speed,
                    bearing: dto.bearing,
                    provider: dto.provider,
                    timestamp: new Date(),
                },
            });
        }
        else {
            location = await this.prisma.location.create({
                data: {
                    deviceId: device.id,
                    latitude: dto.latitude,
                    longitude: dto.longitude,
                    accuracy: dto.accuracy,
                    altitude: dto.altitude,
                    speed: dto.speed,
                    bearing: dto.bearing,
                    provider: dto.provider,
                },
            });
        }
        this.eventEmitter.emit('location.updated', {
            deviceId: device.id,
            parentId: device.parentId,
            data: location,
        });
        this.eventEmitter.emit('geofence.check', {
            deviceId: device.id,
            parentId: device.parentId,
            latitude: dto.latitude,
            longitude: dto.longitude,
        });
        return location;
    }
    async getLatest(deviceId) {
        return this.prisma.location.findFirst({
            where: { device: { deviceId } },
            orderBy: { timestamp: 'desc' },
        });
    }
    async getHistory(deviceId, limit = 100, from, to) {
        return this.prisma.location.findMany({
            where: {
                device: { deviceId },
                ...(from || to
                    ? {
                        timestamp: {
                            ...(from ? { gte: from } : {}),
                            ...(to ? { lte: to } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], LocationsService);
//# sourceMappingURL=locations.service.js.map