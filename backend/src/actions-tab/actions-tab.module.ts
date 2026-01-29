import { Module } from '@nestjs/common';
import { ActionsTabService } from './actions-tab.service';
import { ActionsTabController } from './actions-tab.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionsTabController],
  providers: [ActionsTabService],
  exports: [ActionsTabService],
})
export class ActionsTabModule {}