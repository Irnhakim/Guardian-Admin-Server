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
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
        timestamp: Date;
    }>;
    getLatest(deviceId: string): Promise<{
        id: string;
        deviceId: string;
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
        timestamp: Date;
    } | null>;
    getHistory(deviceId: string, limit?: number): Promise<{
        id: string;
        deviceId: string;
        level: number;
        isCharging: boolean;
        temperature: number | null;
        voltage: number | null;
        timestamp: Date;
    }[]>;
}
