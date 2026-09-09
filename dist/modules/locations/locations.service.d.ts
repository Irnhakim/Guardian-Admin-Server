import { PrismaService } from '../../prisma/prisma.service';
import { LocationDto } from './dto/location.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class LocationsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    log(deviceId: string, dto: LocationDto): Promise<{
        deviceId: string;
        id: string;
        timestamp: Date;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
    }>;
    getLatest(deviceId: string): Promise<{
        deviceId: string;
        id: string;
        timestamp: Date;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
    } | null>;
    getHistory(deviceId: string, limit?: number, from?: Date, to?: Date): Promise<{
        deviceId: string;
        id: string;
        timestamp: Date;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
    }[]>;
}
