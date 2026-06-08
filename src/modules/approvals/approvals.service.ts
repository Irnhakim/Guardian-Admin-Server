import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(deviceId: string, dto: CreateApprovalDto) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const approval = await this.prisma.appApproval.upsert({
      where: {
        deviceId_packageName: {
          deviceId: device.id,
          packageName: dto.packageName,
        },
      },
      create: {
        deviceId: device.id,
        packageName: dto.packageName,
        appName: dto.appName,
        installer: dto.installer,
        status: 'PENDING',
      },
      update: {
        appName: dto.appName,
        installer: dto.installer,
        status: 'PENDING',
        requestedAt: new Date(),
        resolvedAt: null,
      },
    });

    this.eventEmitter.emit('approval.requested', {
      deviceId: device.id,
      parentId: device.parentId,
      data: approval,
    });

    return approval;
  }

  async getHistory(deviceId: string) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.appApproval.findMany({
      where: { deviceId: device.id },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async resolve(id: string, parentId: string, dto: ResolveApprovalDto) {
    const approval = await this.prisma.appApproval.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!approval) throw new NotFoundException('Approval request not found');
    if (approval.device.parentId !== parentId) {
      throw new ForbiddenException('You do not have permission to manage this device');
    }

    const updated = await this.prisma.appApproval.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt: new Date(),
      },
    });

    this.eventEmitter.emit('approval.resolved', {
      deviceId: approval.device.id,
      deviceHardwareId: approval.device.deviceId,
      packageName: approval.packageName,
      appName: approval.appName,
      status: dto.status,
    });

    return updated;
  }
}
