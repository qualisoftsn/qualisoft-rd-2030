import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SignatureService {
  constructor(private prisma: PrismaService) {}

  async signAttendance(causerieId: string, userId: string, tenantId: string) {
    // 1. Création du contenu à hacher (Payload)
    const payload = `${causerieId}-${userId}-${Date.now()}`;
    
    // 2. Génération du Hash SHA-256
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    // 3. Stockage dans la table Signature (selon ton schéma Prisma)
    return await this.prisma.signature.create({
      data: {
        SIG_EntityType: 'CAUSERIE_PARTICIPANT',
        SIG_EntityId: causerieId,
        SIG_UserId: userId,
        SIG_Hash: hash,
        SIG_Metadata: {
          userAgent: 'Mobile_Browser_Secure',
          ip: 'Logged_IP',
          timestamp: new Date().toISOString()
        },
        tenantId
      }
    });
  }
}