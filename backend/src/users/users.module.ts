// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module'; // ✅ Ajoute cet import

@Module({
  imports: [
    PrismaModule, 
    CommonModule // ✅ Ajoute ceci ici
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}