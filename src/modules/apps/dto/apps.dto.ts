import {
  IsString, IsBoolean, IsOptional, IsInt, IsArray, ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AppInfoDto {
  @ApiProperty({ example: 'com.google.android.youtube' })
  @IsString()
  packageName: string;

  @ApiProperty({ example: 'YouTube' })
  @IsString()
  appName: string;

  @ApiPropertyOptional({ example: '19.15.34' })
  @IsOptional()
  @IsString()
  versionName?: string;

  @ApiPropertyOptional({ example: 1230000 })
  @IsOptional()
  @IsInt()
  versionCode?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSystemApp?: boolean;
}

export class SyncAppsDto {
  @ApiProperty({ type: [AppInfoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppInfoDto)
  apps: AppInfoDto[];
}

export class AppUsageDto {
  @ApiProperty({ example: 'com.google.android.youtube' })
  @IsString()
  packageName: string;

  @ApiProperty({ example: 'YouTube' })
  @IsString()
  appName: string;

  @ApiProperty({ example: 8100000, description: 'Usage in milliseconds' })
  @IsInt()
  usageMs: number;

  @ApiProperty({ example: '2024-01-15', description: 'Date (YYYY-MM-DD)' })
  @IsString()
  date: string;
}

export class SyncUsageDto {
  @ApiProperty({ type: [AppUsageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppUsageDto)
  usages: AppUsageDto[];
}
