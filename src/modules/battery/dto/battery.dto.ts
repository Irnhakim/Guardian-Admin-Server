import { IsInt, IsBoolean, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatteryLogDto {
  @ApiProperty({ example: 85, description: 'Battery level 0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  level: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCharging: boolean;

  @ApiPropertyOptional({ example: 31.5, description: 'Temperature in Celsius' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 4200, description: 'Voltage in mV' })
  @IsOptional()
  @IsInt()
  voltage?: number;
}
