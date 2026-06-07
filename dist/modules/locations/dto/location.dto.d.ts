import { LocationMode } from '@prisma/client';
export declare class LocationDto {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    bearing?: number;
    provider?: string;
}
export declare class UpdateLocationModeDto {
    mode: LocationMode;
}
