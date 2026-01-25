import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ContactService } from './contact.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    // Configuration Passport avec la stratégie par défaut
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    // Configuration JWT avec secret d'environnement
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_QUALISOFT',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, ContactService], 
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtStrategy], // Exportation pour usage global
})
export class AuthModule {}