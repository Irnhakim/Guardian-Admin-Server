import { ApprovalStatus } from '@prisma/client';
export declare class CreateApprovalDto {
    packageName: string;
    appName: string;
    installer?: string;
}
export declare class ResolveApprovalDto {
    status: ApprovalStatus;
}
