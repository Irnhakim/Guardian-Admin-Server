import {
  Controller, Post, Get, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Approvals')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'devices/:deviceId/approvals', version: '1' })
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an app installation approval request from device' })
  create(@Param('deviceId') deviceId: string, @Body() dto: CreateApprovalDto) {
    return this.approvalsService.create(deviceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get app installation approvals list' })
  getHistory(@Param('deviceId') deviceId: string) {
    return this.approvalsService.getHistory(deviceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Approve or reject a package installation request' })
  resolve(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ResolveApprovalDto,
  ) {
    return this.approvalsService.resolve(id, req.user.userId, dto);
  }
}
