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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const devices_service_1 = require("./devices.service");
const device_dto_1 = require("./dto/device.dto");
let DevicesController = class DevicesController {
    devicesService;
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    register(dto) {
        return this.devicesService.register(dto);
    }
    findAll() {
        return this.devicesService.findAll();
    }
    findOne(id) {
        return this.devicesService.findOne(id);
    }
    update(id, dto) {
        return this.devicesService.update(id, dto);
    }
    delete(id) {
        return this.devicesService.delete(id);
    }
    addBrowsing(deviceId, dto) {
        return this.devicesService.addBrowsingHistory(deviceId, dto);
    }
    getBrowsing(id) {
        return this.devicesService.getBrowsingHistory(id);
    }
    clearBrowsing(id) {
        return this.devicesService.clearBrowsingHistory(id);
    }
    addCapture(deviceId, dto) {
        return this.devicesService.saveCapture(deviceId, dto);
    }
    getCaptures(id) {
        return this.devicesService.getCaptures(id);
    }
    clearCaptures(id) {
        return this.devicesService.clearCaptures(id);
    }
    deleteCapture(id, captureId) {
        return this.devicesService.deleteCapture(id, captureId);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a child device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_dto_1.RegisterDeviceDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all devices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update device info' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, device_dto_1.UpdateDeviceDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':deviceId/browsing'),
    (0, swagger_1.ApiOperation)({ summary: 'Log browser URL visit from device' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, device_dto_1.CreateBrowsingHistoryDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "addBrowsing", null);
__decorate([
    (0, common_1.Get)(':id/browsing'),
    (0, swagger_1.ApiOperation)({ summary: 'Get browser history for a device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getBrowsing", null);
__decorate([
    (0, common_1.Delete)(':id/browsing'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear browser history for a device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "clearBrowsing", null);
__decorate([
    (0, common_1.Post)(':deviceId/captures'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload camera snapshot capture from device' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, device_dto_1.CreateCaptureDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "addCapture", null);
__decorate([
    (0, common_1.Get)(':id/captures'),
    (0, swagger_1.ApiOperation)({ summary: 'Get camera snapshots for a device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getCaptures", null);
__decorate([
    (0, common_1.Delete)(':id/captures'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all camera snapshots for a device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "clearCaptures", null);
__decorate([
    (0, common_1.Delete)(':id/captures/:captureId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a single camera snapshot' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('captureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "deleteCapture", null);
exports.DevicesController = DevicesController = __decorate([
    (0, swagger_1.ApiTags)('Devices'),
    (0, common_1.Controller)({ path: 'devices', version: '1' }),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map