import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ContactService } from './contact.service'; // 👈 1. IMPORTATION DU NOUVEAU SERVICE
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    // Configuration de la stratégie Passport par défaut
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    // Configuration du moteur JWT pour l'authentification
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    ContactService // 👈 2. AJOUT ICI POUR ACTIVER LA ROUTE /INVITE
  ],
  // Exportation pour permettre l'utilisation du Guard et du Service dans le reste de l'app
  exports: [AuthService, PassportModule], 
})
export class AuthModule {}