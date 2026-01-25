import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Plan, SubscriptionStatus, Role } from '@prisma/client';

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * RÉCUPÉRATION DE TOUTES LES INSTANCES (MONITORING)
   */
  async findAllTenants() {
    return this.prisma.tenant.findMany({
      select: {
        T_Id: true,
        T_Name: true,
        T_Domain: true,
        T_Plan: true,
        T_SubscriptionStatus: true,
        T_SubscriptionEndDate: true,
        T_IsActive: true,
        T_CreatedAt: true,
        _count: {
          select: { T_Users: true } // Compte le nombre d'utilisateurs par instance
        }
      },
      orderBy: { T_CreatedAt: 'desc' }
    });
  }

  /**
   * INITIALISATION D'UN NOUVEAU TENANT (PROVISIONING)
   */
  async initializeNewClient(data: {
    name: string;
    domain: string;
    adminEmail: string;
    plan: Plan;
  }) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.tenant.findFirst({
          where: { OR: [{ T_Domain: data.domain }, { T_Email: data.adminEmail }] }
        });

        if (existing) throw new ConflictException("Domaine ou Email déjà utilisé.");

        const tenant = await tx.tenant.create({
          data: {
            T_Name: data.name,
            T_Email: data.adminEmail,
            T_Domain: data.domain.toLowerCase().trim(),
            T_Plan: data.plan,
            T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
          }
        });

        const site = await tx.site.create({
          data: { S_Name: 'Siège Social', tenantId: tenant.T_Id }
        });

        const unitType = await tx.orgUnitType.create({
          data: { OUT_Label: 'Direction', tenantId: tenant.T_Id }
        });

        const orgUnit = await tx.orgUnit.create({
          data: {
            OU_Name: 'Direction Générale',
            OU_TypeId: unitType.OUT_Id,
            OU_SiteId: site.S_Id,
            tenantId: tenant.T_Id
          }
        });

        const hashedPassword = await bcrypt.hash('Elite2030!', 10);
        await tx.user.create({
          data: {
            U_Email: data.adminEmail,
            U_PasswordHash: hashedPassword,
            U_FirstName: 'Admin',
            U_LastName: data.name.toUpperCase(),
            U_Role: Role.ADMIN,
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id,
            U_OrgUnitId: orgUnit.OU_Id
          }
        });

        return { tenantId: tenant.T_Id, domain: tenant.T_Domain };
      });
    } catch (error) {
      this.logger.error(`❌ Erreur Provisioning : ${data.name}`, error instanceof Error ? error.stack : error);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Échec de l'initialisation de l'instance.");
    }
  }
}