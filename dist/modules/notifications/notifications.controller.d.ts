import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    log(deviceId: string, dto: CreateNotificationDto): Promise<{
        id: string;
        packageName: string;
        appName: string;
        title: string | null;
        text: string | null;
        category: string | null;
        receivedAt: Date;
        deviceId: string;
    }>;
    getHistory(deviceId: string, limit?: number): Promise<{
        id: string;
        packageName: string;
        appName: string;
        title: string | null;
        text: string | null;
        category: string | null;
        receivedAt: Date;
        deviceId: string;
    }[]>;
}
