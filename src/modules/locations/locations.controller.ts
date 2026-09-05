import {
  Controller, Post, Get, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { LocationDto } from './dto/location.dto';

@ApiTags('Locations')
@Controller({ path: 'devices/:deviceId/location', version: '1' })
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit GPS location from device' })
  log(@Param('deviceId') deviceId: string, @Body() dto: LocationDto) {
    return this.locationsService.log(deviceId, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest location' })
  getLatest(@Param('deviceId') deviceId: string) {
    return this.locationsService.getLatest(deviceId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get location history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.locationsService.getHistory(
      deviceId,
      limit,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }
}
