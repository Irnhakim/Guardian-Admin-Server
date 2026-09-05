export declare class RegisterDeviceDto {
    deviceId: string;
    deviceName: string;
    brand: string;
    model: string;
    androidVersion: string;
    securityPatch?: string;
    fcmToken?: string;
    permissions?: Record<string, boolean>;
}
export declare class UpdateDeviceDto {
    deviceName?: string;
    fcmToken?: string;
    androidVersion?: string;
    securityPatch?: string;
    permissions?: Record<string, boolean>;
}
