import { BatteryService } from './battery.service';
import { BatteryLogDto } from './dto/battery.dto';
export declare class BatteryController {
    private batteryService;
    constructor(batteryService: BatteryService);
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
