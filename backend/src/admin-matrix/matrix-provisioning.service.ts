/**
 * 🛰️ MATRIX PROVISIONING SERVICE - QUALISOFT ELITE RD 2030
 * RÔLE : Orchestration du "Big Bang" (Provisioning Atomique ISO-9001)
 * VERSION : 3.0.0 (Scellage Intégral)
 */

import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisioningDto } from './dto/provisioning.dto';
import * as bcrypt from 'bcryptjs';
import { Role, Plan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class MatrixProvisioningService {
  private readonly logger = new Logger(MatrixProvisioningService.name);

  constructor(private prisma: PrismaService) {}

  async initializeNewTenant(payload: ProvisioningDto) {
    const { 
      companyName, customSlug, ceoName, email, adminPassword,
      adminFirstName, adminLastName, phone, address 
    } = payload;

    const domain = `${customSlug.toLowerCase().trim()}.qualisoft.sn`;

    const existing = await this.prisma.tenant.findFirst({
      where: { OR: [{ T_Domain: domain }, { T_Email: email.toLowerCase() }] }
    });
    
    if (existing) {
      throw new ConflictException(`Le domaine [${domain}] ou l'email est déjà scellé dans la Matrix.`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            T_Name: companyName.toUpperCase(), T_Domain: domain, T_Email: email.toLowerCase(),
            T_CeoName: ceoName, T_Phone: phone, T_Address: address,
            T_Plan: Plan.ENTREPRISE, T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
            T_ContractDuration: 24, T_TacitRenewal: true, T_IsActive: true,
          },
        });

        const site = await tx.site.create({
          data: { S_Name: 'SIÈGE SOCIAL', S_Address: address, S_IsActive: true, tenantId: tenant.T_Id },
        });

        const typeDirection = await tx.orgUnitType.create({ data: { OUT_Label: 'DIRECTION', tenantId: tenant.T_Id } });
        await tx.orgUnitType.create({ data: { OUT_Label: 'DÉPARTEMENT', tenantId: tenant.T_Id } });
        await tx.orgUnitType.create({ data: { OUT_Label: 'SERVICE', tenantId: tenant.T_Id } });

        const orgUnit = await tx.orgUnit.create({
          data: { OU_Name: 'DIRECTION GÉNÉRALE', OU_TypeId: typeDirection.OUT_Id, OU_SiteId: site.S_Id, tenantId: tenant.T_Id },
        });

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(adminPassword, salt);
        
        await tx.user.create({
          data: {
            U_Email: email.toLowerCase().trim(), U_PasswordHash: hashedPass,
            U_FirstName: adminFirstName, U_LastName: adminLastName,
            U_Role: Role.ADMIN, U_IsActive: true, U_FirstLogin: true,
            tenantId: tenant.T_Id, U_SiteId: site.S_Id, U_OrgUnitId: orgUnit.OU_Id,
          },
        });

        this.logger.log(`✅ NŒUD SCELLÉ : ${tenant.T_Name} sur ${domain}`);
        return { 
          success: true, tenantId: tenant.T_Id, domain: tenant.T_Domain, message: "Protocole Big Bang achevé avec succès."
        };
      });
    } catch (error: any) {
      this.logger.error(`❌ Échec Big Bang : ${error.message}`);
      throw new InternalServerErrorException("Rupture de la transaction atomique de provisioning.");
    }
  }
}