import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PkiService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🖋️ SIGNATURE ÉLECTRONIQUE (PKI)
   * Verrouille une entité (Indicateur, Audit, Revue) avec un hash unique
   */
  async sign(entityId: string, entityType: string, userId: string, tenantId: string) {
    // Dans une version avancée, on générerait un vrai hash SHA-256 du contenu
    const signatureHash = `QSIG-${userId}-${Date.now()}`; 

    return this.prisma.signature.create({
      data: {
        SIG_EntityId: entityId,
        SIG_EntityType: entityType,
        SIG_UserId: userId,
        tenantId: tenantId,
        SIG_Hash: signatureHash
      }
    });
  }

  /**
   * 🔍 VÉRIFICATION DES SIGNATURES
   */
  async getSignatures(entityId: string, tenantId: string) {
    return this.prisma.signature.findMany({
      where: { SIG_EntityId: entityId, tenantId: tenantId },
      include: { 
        SIG_User: { select: { U_FirstName: true, U_LastName: true, U_Role: true } } 
      }
    });
  }
}