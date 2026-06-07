import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NotificationsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
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
