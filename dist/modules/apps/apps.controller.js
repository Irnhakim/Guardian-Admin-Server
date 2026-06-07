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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const apps_service_1 = require("./apps.service");
const apps_dto_1 = require("./dto/apps.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AppsController = class AppsController {
    appsService;
    constructor(appsService) {
        this.appsService = appsService;
    }
    syncApps(deviceId, dto) {
        return this.appsService.syncApps(deviceId, dto);
    }
    getApps(deviceId, includeSystem) {
        return this.appsService.getApps(deviceId, includeSystem === 'true');
    }
    syncUsage(deviceId, dto) {
        return this.appsService.syncUsage(deviceId, dto);
    }
    getUsage(deviceId, from, to) {
        return this.appsService.getUsage(deviceId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    }
    getDailyUsage(deviceId, date) {
        return this.appsService.getDailyUsage(deviceId, date);
    }
};
exports.AppsController = AppsController;
__decorate([
    (0, common_1.Post)('apps/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync installed app list from device' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apps_dto_1.SyncAppsDto]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "syncApps", null);
__decorate([
    (0, common_1.Get)('apps'),
    (0, swagger_1.ApiOperation)({ summary: 'Get installed apps' }),
    (0, swagger_1.ApiQuery)({ name: 'includeSystem', required: false, type: Boolean }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('includeSystem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "getApps", null);
__decorate([
    (0, common_1.Post)('usage/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync app usage statistics from device' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apps_dto_1.SyncUsageDto]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "syncUsage", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated usage statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)('usage/daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Get usage for a specific day' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, example: '2024-01-15' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "getDailyUsage", null);
exports.AppsController = AppsController = __decorate([
    (0, swagger_1.ApiTags)('Apps'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'devices/:deviceId', version: '1' }),
    __metadata("design:paramtypes", [apps_service_1.AppsService])
], AppsController);
//# sourceMappingURL=apps.controller.js.map