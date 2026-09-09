import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';
export declare class ApprovalsController {
    private approvalsService;
    constructor(approvalsService: ApprovalsService);
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
