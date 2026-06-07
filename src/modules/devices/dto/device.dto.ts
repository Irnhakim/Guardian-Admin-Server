import {
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 'Redmi Note 12' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({ example: 'Xiaomi' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: '23021RAA2Y' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: '15' })
  @IsString()
  @IsNotEmpty()
  androidVersion: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsString()
  securityPatch?: string;

  @ApiPropertyOptional({ description: 'Firebase Cloud Messaging token' })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}

export class UpdateDeviceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  androidVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  securityPatch?: string;
}
