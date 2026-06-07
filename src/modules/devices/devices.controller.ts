import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Devices')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'devices', version: '1' })
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a child device' })
  register(@Body() dto: RegisterDeviceDto, @Request() req: any) {
    return this.devicesService.register(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices for parent' })
  findAll(@Request() req: any) {
    return this.devicesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.devicesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update device info' })
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove device' })
  delete(@Param('id') id: string, @Request() req: any) {
    return this.devicesService.delete(id, req.user.userId);
  }
}
