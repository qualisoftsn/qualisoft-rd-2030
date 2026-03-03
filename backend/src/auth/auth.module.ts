/**
 * 🛡️ MODULE : AuthModule.ts
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation des protocoles d'authentification Matrix.
 * CORRECTIF : Casting de type pour 'expiresIn' (Fix String/Number Mismatch).
 * RÉVISION : 03 Mars 2026 | 07:15 GMT
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
            /**
             * 🔱 FIX : L'interface NestJS attend parfois un type union complexe.
             * On force l'interprétation en tant que 'any' ou 'string' pour 
             * autoriser les formats '15m' ou '24h' définis dans le .env.
             */
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