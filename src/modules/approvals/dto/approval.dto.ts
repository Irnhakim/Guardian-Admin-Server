import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '@prisma/client';

export class CreateApprovalDto {
  @ApiProperty({ description: 'Package name of the app being installed' })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({ description: 'Display name of the app' })
  @IsString()
  @IsNotEmpty()
  appName: string;

  @ApiProperty({ description: 'Source package of the installer', required: false })
  @IsString()
  @IsOptional()
  installer?: string;
}

export class ResolveApprovalDto {
  @ApiProperty({ description: 'Resolution status', enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status: ApprovalStatus;
}
