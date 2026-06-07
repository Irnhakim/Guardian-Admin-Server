import { BatteryService } from './battery.service';
import { BatteryLogDto } from './dto/battery.dto';
export declare class BatteryController {
    private batteryService;
    constructor(batteryService: BatteryService);
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
