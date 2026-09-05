import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { DevicesModule } from './modules/devices/devices.module';
import { BatteryModule } from './modules/battery/battery.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AppsModule } from './modules/apps/apps.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DeviceActivityInterceptor } from './common/interceptors/device-activity.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),
    PrismaModule,
    DevicesModule,
    BatteryModule,
    LocationsModule,
    AppsModule,
    GatewayModule,
    NotificationsModule,
    ApprovalsModule,
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
