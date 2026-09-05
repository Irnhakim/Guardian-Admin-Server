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
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';

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
}
