import {
  Controller, Post, Get, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppsService } from './apps.service';
import { SyncAppsDto, SyncUsageDto } from './dto/apps.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Apps')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'devices/:deviceId', version: '1' })
export class AppsController {
  constructor(private appsService: AppsService) {}

  @Post('apps/sync')
  @ApiOperation({ summary: 'Sync installed app list from device' })
  syncApps(@Param('deviceId') deviceId: string, @Body() dto: SyncAppsDto) {
    return this.appsService.syncApps(deviceId, dto);
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get installed apps' })
  @ApiQuery({ name: 'includeSystem', required: false, type: Boolean })
  getApps(
    @Param('deviceId') deviceId: string,
    @Query('includeSystem') includeSystem?: string,
  ) {
    return this.appsService.getApps(deviceId, includeSystem === 'true');
  }

  @Post('usage/sync')
  @ApiOperation({ summary: 'Sync app usage statistics from device' })
  syncUsage(@Param('deviceId') deviceId: string, @Body() dto: SyncUsageDto) {
    return this.appsService.syncUsage(deviceId, dto);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get aggregated usage statistics' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getUsage(
    @Param('deviceId') deviceId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.appsService.getUsage(
      deviceId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('usage/daily')
  @ApiOperation({ summary: 'Get usage for a specific day' })
  @ApiQuery({ name: 'date', required: true, example: '2024-01-15' })
  getDailyUsage(
    @Param('deviceId') deviceId: string,
    @Query('date') date: string,
  ) {
    return this.appsService.getDailyUsage(deviceId, date);
  }
}
