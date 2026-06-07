import {
  Controller, Post, Get, Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BatteryService } from './battery.service';
import { BatteryLogDto } from './dto/battery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Battery')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'devices/:deviceId/battery', version: '1' })
export class BatteryController {
  constructor(private batteryService: BatteryService) {}

  @Post()
  @ApiOperation({ summary: 'Submit battery status from device' })
  log(@Param('deviceId') deviceId: string, @Body() dto: BatteryLogDto) {
    return this.batteryService.log(deviceId, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest battery status' })
  getLatest(@Param('deviceId') deviceId: string) {
    return this.batteryService.getLatest(deviceId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get battery history' })
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.batteryService.getHistory(deviceId, limit);
  }
}
