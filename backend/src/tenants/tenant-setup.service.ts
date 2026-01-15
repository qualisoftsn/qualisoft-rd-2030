import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantSetupService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initialise les données par défaut pour un nouveau client (Tenant)
   */
  async setupNewTenant(tenantId: string) {
    console.log(`[Setup] Initialisation du Tenant : ${tenantId}`);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Création des Types de Processus standards
      await tx.processType.createMany({
        data: [
          { PT_Label: 'MANAGEMENT', PT_Color: '#3b82f6', PT_Description: 'Pilotage et stratégie', tenantId },
          { PT_Label: 'RÉALISATION', PT_Color: '#10b981', PT_Description: 'Cœur de métier et production', tenantId },
          { PT_Label: 'SUPPORT', PT_Color: '#f59e0b', PT_Description: 'Ressources et appui', tenantId },
        ],
      });

      // 2. Création des Types d'Unités Organiques standards
      await tx.orgUnitType.createMany({
        data: [
          { OUT_Label: 'DIRECTION', OUT_Description: 'Top Management', tenantId },
          { OUT_Label: 'DÉPARTEMENT', OUT_Description: 'Pôles fonctionnels', tenantId },
          { OUT_Label: 'SERVICE', OUT_Description: 'Unités opérationnelles', tenantId },
        ],
      });

      // 3. Création des Types de Risques par défaut
      await tx.riskType.createMany({
        data: [
          { RT_Label: 'QUALITÉ', RT_Description: 'Risques liés à la satisfaction client', tenantId },
          { RT_Label: 'SÉCURITÉ', RT_Description: 'Risques liés à la santé et sécurité', tenantId },
          { RT_Label: 'ENVIRONNEMENT', RT_Description: 'Risques liés à l\'impact écologique', tenantId },
        ],
      });

      console.log(`[Setup] Terminé pour le Tenant : ${tenantId}`);
      return { success: true };
    });
  }
}