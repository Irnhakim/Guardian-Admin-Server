import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NotificationsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    log(deviceId: string, dto: CreateNotificationDto): Promise<{
        title: string | null;
        id: string;
        deviceId: string;
        packageName: string;
        appName: string;
        text: string | null;
        category: string | null;
        receivedAt: Date;
    }>;
    getHistory(deviceId: string, limit?: number): Promise<{
        title: string | null;
        id: string;
        deviceId: string;
        packageName: string;
        appName: string;
        text: string | null;
        category: string | null;
        receivedAt: Date;
    }[]>;
    clearNotifications(deviceId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
