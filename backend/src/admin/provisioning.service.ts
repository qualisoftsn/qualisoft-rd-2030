import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(private prisma: PrismaService) {}

  async initializeNewClient(data: { companyName: string; adminEmail: string; domain?: string; defaultPassword?: string }) {
    const domain = (data.domain || data.companyName).toLowerCase().trim().replace(/\s+/g, '-');
    const email = data.adminEmail.toLowerCase().trim();
    const passwordRaw = data.defaultPassword || 'qs@20252030';
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Tenant
        const tenant = await tx.tenant.upsert({
          where: { T_Email: email }, // On se base sur l'email décisionnel
          update: { T_Name: data.companyName, T_Domain: domain, T_IsActive: true },
          create: {
            T_Name: data.companyName,
            T_Email: email,
            T_Domain: domain,
            T_Plan: 'ESSAI' as any,
            T_SubscriptionStatus: 'TRIAL' as any,
            T_IsActive: true,
          },
        });

        // 2. Site
        const site = await tx.site.upsert({
          where: { S_Id: `SITE-${tenant.T_Id}` },
          update: { S_Name: `Siège Social - ${tenant.T_Name}` },
          create: { 
            S_Id: `SITE-${tenant.T_Id}`, 
            S_Name: `Siège Social - ${tenant.T_Name}`, 
            tenantId: tenant.T_Id 
          },
        });

        // 3. Admin
        await tx.user.upsert({
          where: { U_Email: email },
          update: { U_PasswordHash: hashedPassword, tenantId: tenant.T_Id, U_SiteId: site.S_Id, U_IsActive: true },
          create: {
            U_Email: email,
            U_PasswordHash: hashedPassword,
            U_FirstName: 'Admin',
            U_LastName: tenant.T_Name,
            U_Role: 'ADMIN' as any,
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id,
            U_IsActive: true,
            U_FirstLogin: true
          }
        });

        return { success: true, tenantId: tenant.T_Id, domain: tenant.T_Domain };
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`🚨 Échec Provisioning : ${msg}`);
      throw new InternalServerErrorException(`Erreur d'activation : ${msg}`);
    }
  }
}