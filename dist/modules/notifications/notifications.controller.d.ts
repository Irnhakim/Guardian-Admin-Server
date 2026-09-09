import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    log(deviceId: string, dto: CreateNotificationDto): Promise<{
        id: string;
        deviceId: string;
        title: string | null;
        packageName: string;
        appName: string;
        text: string | null;
        category: string | null;
        receivedAt: Date;
    }>;
    getHistory(deviceId: string, limit?: number): Promise<{
        id: string;
        deviceId: string;
        title: string | null;
        packageName: string;
        appName: string;
        text: string | null;
        category: string | null;
        receivedAt: Date;
    }[]>;
    clear(deviceId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
