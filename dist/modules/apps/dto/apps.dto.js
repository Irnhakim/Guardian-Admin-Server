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
exports.SyncUsageDto = exports.AppUsageDto = exports.SyncAppsDto = exports.AppInfoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AppInfoDto {
    packageName;
    appName;
    versionName;
    versionCode;
    isSystemApp;
}
exports.AppInfoDto = AppInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'com.google.android.youtube' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppInfoDto.prototype, "packageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'YouTube' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppInfoDto.prototype, "appName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '19.15.34' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppInfoDto.prototype, "versionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1230000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AppInfoDto.prototype, "versionCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AppInfoDto.prototype, "isSystemApp", void 0);
class SyncAppsDto {
    apps;
}
exports.SyncAppsDto = SyncAppsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AppInfoDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AppInfoDto),
    __metadata("design:type", Array)
], SyncAppsDto.prototype, "apps", void 0);
class AppUsageDto {
    packageName;
    appName;
    usageMs;
    date;
}
exports.AppUsageDto = AppUsageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'com.google.android.youtube' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppUsageDto.prototype, "packageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'YouTube' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppUsageDto.prototype, "appName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8100000, description: 'Usage in milliseconds' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AppUsageDto.prototype, "usageMs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15', description: 'Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppUsageDto.prototype, "date", void 0);
class SyncUsageDto {
    usages;
}
exports.SyncUsageDto = SyncUsageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AppUsageDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AppUsageDto),
    __metadata("design:type", Array)
], SyncUsageDto.prototype, "usages", void 0);
//# sourceMappingURL=apps.dto.js.map