import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // 👈 1. IMPORTATION INDISPENSABLE

@Module({
  imports: [
    UsersModule,
    // 👈 2. ON PRÉCISE LA STRATÉGIE PAR DÉFAUT
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  // 👈 3. AJOUT DE JwtStrategy DANS LES PROVIDERS
  providers: [AuthService, JwtStrategy], 
  controllers: [AuthController],
  // 👈 4. EXPORTATION POUR QUE LES AUTRES MODULES RECONNAISSENT LE GUARD
  exports: [AuthService, PassportModule], 
})
export class AuthModule {}