import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // Génère un token de session pour la causerie (valide 1 heure)
  generateSessionToken(causerieId: string, tenantId: string) {
    return jwt.sign(
      { causerieId, tenantId, timestamp: Date.now() },
      process.env.JWT_SECRET || 'qualisoft_secret',
      { expiresIn: '1h' }
    );
  }

  // Valide la présence via le QR Code
  async markAsPresent(token: string, userId: string) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'qualisoft_secret');
      
      return await this.prisma.causerie.update({
        where: { CS_Id: decoded.causerieId },
        data: {
          CS_Participants: {
            connect: { U_Id: userId }
          }
        }
      });
    } catch (e) {
      throw new BadRequestException("Lien d'émargement invalide ou expiré");
    }
  }
}