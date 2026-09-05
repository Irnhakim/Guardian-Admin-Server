import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ApprovalsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(deviceId: string, dto: CreateApprovalDto): Promise<{
        deviceId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    getHistory(deviceId: string): Promise<{
        deviceId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }[]>;
    resolve(id: string, dto: ResolveApprovalDto): Promise<{
        deviceId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
}
