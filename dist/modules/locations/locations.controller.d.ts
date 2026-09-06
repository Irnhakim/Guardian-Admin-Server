import { LocationsService } from './locations.service';
import { LocationDto } from './dto/location.dto';
export declare class LocationsController {
    private locationsService;
    constructor(locationsService: LocationsService);
    log(deviceId: string, dto: LocationDto): Promise<{
        id: string;
        deviceId: string;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
        timestamp: Date;
    }>;
    getLatest(deviceId: string): Promise<{
        id: string;
        deviceId: string;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
        timestamp: Date;
    } | null>;
    getHistory(deviceId: string, limit?: number, from?: string, to?: string): Promise<{
        id: string;
        deviceId: string;
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        speed: number | null;
        bearing: number | null;
        provider: string | null;
        timestamp: Date;
    }[]>;
}
