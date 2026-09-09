import { PrismaService } from '../../prisma/prisma.service';
import { BatteryLogDto } from './dto/battery.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class BatteryService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    log(deviceId: string, dto: BatteryLogDto): Promise<{
        id: string;
        deviceId: string;
        timestamp: Date;
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
    }>;
    getLatest(deviceId: string): Promise<{
        id: string;
        deviceId: string;
        timestamp: Date;
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
    } | null>;
    getHistory(deviceId: string, limit?: number): Promise<{
        id: string;
        deviceId: string;
        timestamp: Date;
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
    }[]>;
}
