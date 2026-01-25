import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersManagementController } from './users-management.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [UsersController, UsersManagementController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}