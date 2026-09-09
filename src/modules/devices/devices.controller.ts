import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto, CreateBrowsingHistoryDto, CreateCaptureDto } from './dto/device.dto';

@ApiTags('Devices')
@Controller({ path: 'devices', version: '1' })
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a child device' })
  register(@Body() dto: RegisterDeviceDto) {
    return this.devicesService.register(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device details' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update device info' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove device' })
  delete(@Param('id') id: string) {
    return this.devicesService.delete(id);
  }

  @Post(':deviceId/browsing')
  @ApiOperation({ summary: 'Log browser URL visit from device' })
  addBrowsing(
    @Param('deviceId') deviceId: string,
    @Body() dto: CreateBrowsingHistoryDto,
  ) {
    return this.devicesService.addBrowsingHistory(deviceId, dto);
  }

  @Get(':id/browsing')
  @ApiOperation({ summary: 'Get browser history for a device' })
  getBrowsing(@Param('id') id: string) {
    return this.devicesService.getBrowsingHistory(id);
  }

  @Delete(':id/browsing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear browser history for a device' })
  clearBrowsing(@Param('id') id: string) {
    return this.devicesService.clearBrowsingHistory(id);
  }

  @Post(':deviceId/captures')
  @ApiOperation({ summary: 'Upload camera snapshot capture from device' })
  addCapture(
    @Param('deviceId') deviceId: string,
    @Body() dto: CreateCaptureDto,
  ) {
    return this.devicesService.saveCapture(deviceId, dto);
  }

  @Get(':id/captures')
  @ApiOperation({ summary: 'Get camera snapshots for a device' })
  getCaptures(@Param('id') id: string) {
    return this.devicesService.getCaptures(id);
  }

  @Delete(':id/captures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all camera snapshots for a device' })
  clearCaptures(@Param('id') id: string) {
    return this.devicesService.clearCaptures(id);
  }

  @Delete(':id/captures/:captureId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a single camera snapshot' })
  deleteCapture(
    @Param('id') id: string,
    @Param('captureId') captureId: string,
  ) {
    return this.devicesService.deleteCapture(id, captureId);
  }
}
