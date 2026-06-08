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
exports.ResolveApprovalDto = exports.CreateApprovalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateApprovalDto {
    packageName;
    appName;
    installer;
}
exports.CreateApprovalDto = CreateApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package name of the app being installed' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "packageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display name of the app' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "appName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source package of the installer', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "installer", void 0);
class ResolveApprovalDto {
    status;
}
exports.ResolveApprovalDto = ResolveApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resolution status', enum: client_1.ApprovalStatus }),
    (0, class_validator_1.IsEnum)(client_1.ApprovalStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResolveApprovalDto.prototype, "status", void 0);
//# sourceMappingURL=approval.dto.js.map