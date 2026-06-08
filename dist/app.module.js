"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const devices_module_1 = require("./modules/devices/devices.module");
const battery_module_1 = require("./modules/battery/battery.module");
const locations_module_1 = require("./modules/locations/locations.module");
const apps_module_1 = require("./modules/apps/apps.module");
const gateway_module_1 = require("./modules/gateway/gateway.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const approvals_module_1 = require("./modules/approvals/approvals.module");
const app_controller_1 = require("./app.controller");
const core_1 = require("@nestjs/core");
const device_activity_interceptor_1 = require("./common/interceptors/device-activity.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            devices_module_1.DevicesModule,
            battery_module_1.BatteryModule,
            locations_module_1.LocationsModule,
            apps_module_1.AppsModule,
            gateway_module_1.GatewayModule,
            notifications_module_1.NotificationsModule,
            approvals_module_1.ApprovalsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: device_activity_interceptor_1.DeviceActivityInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map