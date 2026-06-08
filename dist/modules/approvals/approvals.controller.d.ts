import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ResolveApprovalDto } from './dto/approval.dto';
export declare class ApprovalsController {
    private approvalsService;
    constructor(approvalsService: ApprovalsService);
    create(deviceId: string, dto: CreateApprovalDto): Promise<{
        id: string;
        deviceId: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    getHistory(deviceId: string): Promise<{
        id: string;
        deviceId: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }[]>;
    resolve(id: string, req: any, dto: ResolveApprovalDto): Promise<{
        id: string;
        deviceId: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        packageName: string;
        appName: string;
        installer: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
}
