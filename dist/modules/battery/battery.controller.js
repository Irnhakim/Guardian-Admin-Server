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
exports.BatteryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const battery_service_1 = require("./battery.service");
const battery_dto_1 = require("./dto/battery.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BatteryController = class BatteryController {
    batteryService;
    constructor(batteryService) {
        this.batteryService = batteryService;
    }
    log(deviceId, dto) {
        return this.batteryService.log(deviceId, dto);
    }
    getLatest(deviceId) {
        return this.batteryService.getLatest(deviceId);
    }
    getHistory(deviceId, limit) {
        return this.batteryService.getHistory(deviceId, limit);
    }
};
exports.BatteryController = BatteryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit battery status from device' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, battery_dto_1.BatteryLogDto]),
    __metadata("design:returntype", void 0)
], BatteryController.prototype, "log", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest battery status' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BatteryController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get battery history' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], BatteryController.prototype, "getHistory", null);
exports.BatteryController = BatteryController = __decorate([
    (0, swagger_1.ApiTags)('Battery'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'devices/:deviceId/battery', version: '1' }),
    __metadata("design:paramtypes", [battery_service_1.BatteryService])
], BatteryController);
//# sourceMappingURL=battery.controller.js.map