import {
  IsNumber, IsOptional, IsString, Min, Max, IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationMode } from '@prisma/client';

export class LocationDto {
  @ApiProperty({ example: -6.2088 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 106.8456 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 10.5, description: 'Accuracy in meters' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({ example: 0.5, description: 'Speed in m/s' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 180.0 })
  @IsOptional()
  @IsNumber()
  bearing?: number;

  @ApiPropertyOptional({ example: 'fused' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class UpdateLocationModeDto {
  @ApiProperty({ enum: LocationMode })
  @IsEnum(LocationMode)
  mode: LocationMode;
}
