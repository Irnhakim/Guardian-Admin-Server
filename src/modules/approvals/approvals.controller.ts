import {
  Controller, Post, Get, Patch, Body, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';

@ApiTags('Approvals')
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
    @Body() dto: ResolveApprovalDto,
  ) {
    return this.approvalsService.resolve(id, dto);
  }
}
