/**
 * CHEMIN ABSOLU : /backend/src/matrix/matrix.module.ts
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ Import nécessaire
import { MatrixController } from './matrix.controller';
import { MatrixService } from './matrix.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // ✅ On injecte le JwtModule avec la même clé secrète que ton AuthModule
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Qualisoft@2026',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [MatrixController],
  providers: [MatrixService],
  exports: [MatrixService],
})
export class MatrixModule {}