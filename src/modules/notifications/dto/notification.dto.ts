import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Package name of the app sending the notification' })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({ description: 'Display name of the app sending the notification' })
  @IsString()
  @IsNotEmpty()
  appName: string;

  @ApiProperty({ description: 'Title of the notification', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Text body of the notification', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Category of the notification', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}
