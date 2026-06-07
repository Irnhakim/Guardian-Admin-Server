import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    role?: Role;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
