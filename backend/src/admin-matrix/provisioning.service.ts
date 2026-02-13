import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Plan, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ProvisioningDto } from './dto/provisioning.dto';

@Injectable()
export class ProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeNewClient(data: ProvisioningDto) {
    // Génération du domaine technique (SDE -> sde)
    const domainNormalized = data.companyName.toLowerCase().trim().replace(/\s+/g, '-');
    const hashedPassword = await bcrypt.hash(data.password || 'Qualisoft@2026', 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Création du Tenant
        const tenant = await tx.tenant.create({
          data: {
            T_Name: data.companyName,
            T_Email: data.email,
            T_Domain: domainNormalized,
            T_CeoName: data.ceoName,
            T_Phone: data.phone,
            T_Address: data.address,
            T_Plan: Plan.ESSAI,
            T_IsActive: true,
          },
        });

        // 2. Création du Site
        const site = await tx.site.create({
          data: { S_Name: `SIÈGE - ${tenant.T_Name.toUpperCase()}`, tenantId: tenant.T_Id }
        });

        // 3. Création de l'Admin
        await tx.user.create({
          data: {
            U_Email: data.email.toLowerCase(),
            U_PasswordHash: hashedPassword,
            U_FirstName: data.adminFirstName,
            U_LastName: data.adminLastName,
            U_Role: Role.ADMIN,
            tenantId: tenant.T_Id,
            U_SiteId: site.S_Id
          }
        });

        return { success: true, tenantId: tenant.T_Id };
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new InternalServerErrorException("Échec du scellage : " + errorMessage);
    }
  }
}