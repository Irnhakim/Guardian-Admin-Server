import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DevicesModule } from './modules/devices/devices.module';
import { BatteryModule } from './modules/battery/battery.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AppsModule } from './modules/apps/apps.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DeviceActivityInterceptor } from './common/interceptors/device-activity.interceptor';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Event system for real-time WebSocket bridging
    EventEmitterModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    DevicesModule,
    BatteryModule,
    LocationsModule,
    AppsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DeviceActivityInterceptor,
    },
  ],
})
export class AppModule {}
