import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GuardianGateway } from './guardian.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'guardian_jwt_secret',
    }),
  ],
  providers: [GuardianGateway],
  exports: [GuardianGateway],
})
export class GatewayModule {}
