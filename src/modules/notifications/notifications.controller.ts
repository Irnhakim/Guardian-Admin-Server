import {
  Controller, Post, Get, Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'devices/:deviceId/notifications', version: '1' })
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit notification from device' })
  log(@Param('deviceId') deviceId: string, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.log(deviceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get notification history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.notificationsService.getHistory(deviceId, limit);
  }
}
