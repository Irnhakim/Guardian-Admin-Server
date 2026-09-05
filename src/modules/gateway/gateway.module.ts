import { Module } from '@nestjs/common';
import { GuardianGateway } from './guardian.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GuardianGateway],
  exports: [GuardianGateway],
})
export class GatewayModule {}
