/**
 * 🛡️ MODULE : AuthModule.ts (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation des protocoles d'authentification Matrix.
 * RÉVISION : 04 Mars 2026 | 18:46 GMT
 * -------------------------------------------------------------------------
 */

import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error("🚨 CRITIQUE : 'JWT_SECRET' non détecté dans le Kernel.");
        }

        return {
          secret: secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}