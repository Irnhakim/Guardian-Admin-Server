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
exports.DeviceActivityInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
let DeviceActivityInterceptor = class DeviceActivityInterceptor {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const deviceId = request.params?.deviceId;
        return next.handle().pipe((0, operators_1.tap)(async () => {
            if (deviceId) {
                try {
                    const device = await this.prisma.device.update({
                        where: { deviceId },
                        data: {
                            status: client_1.DeviceStatus.ONLINE,
                            lastSeen: new Date(),
                        },
                    });
                    this.eventEmitter.emit('device.status', {
                        deviceId: device.id,
                        parentId: device.parentId,
                        status: 'ONLINE',
                    });
                }
                catch (error) {
                }
            }
        }));
    }
};
exports.DeviceActivityInterceptor = DeviceActivityInterceptor;
exports.DeviceActivityInterceptor = DeviceActivityInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], DeviceActivityInterceptor);
//# sourceMappingURL=device-activity.interceptor.js.map