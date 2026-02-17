/**
 * 🛰️ TENANTS SERVICE - QUALISOFT ELITE RD 2030
 * RÔLE : Gestion administrative des instances et résolution dynamique des nœuds.
 * PHILOSOPHIE : Isolation stricte et haute disponibilité des configurations.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Plan, SubscriptionStatus } from '@prisma/client';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) {}

  // 🛰️ RÉCUPÉRATION DE LA CONFIGURATION (LA CLÉ DE TA VISIBILITÉ)
  // C'est cette fonction qui permet au Frontend de "voir" les données.
  async getConfigBySlug(slug: string) {
    this.logger.log(`🔍 Reconnaissance du nœud Matrix : ${slug}`);

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { T_Domain: slug },                 // Cas match slug (ex: "pad")
          { T_Domain: `${slug}.qualisoft.sn` } // Cas match domaine complet
        ],
        T_IsActive: true,
      },
      include: {
        // On embarque les métadonnées nécessaires au démarrage du SMI
        _count: {
          select: { T_Users: true, T_Processes: true }
        }
      }
    });

    if (!tenant) {
      this.logger.error(`🛑 Échec de reconnaissance : Nœud [${slug}] introuvable.`);
      throw new NotFoundException(`Le territoire ${slug} n'est pas activé dans Qualisoft ELITE.`);
    }

    return tenant;
  }

  // 📈 STATISTIQUES GLOBALES (MATRIX DASHBOARD)
  async getGlobalStats() {
    const [total, active, trial, suspended] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { T_IsActive: true, T_SubscriptionStatus: SubscriptionStatus.ACTIVE } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: SubscriptionStatus.TRIAL } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: 'SUSPENDED' as any } }),
    ]);

    return { 
      totalTenants: total, 
      activeTenants: active, 
      trialTenants: trial, 
      suspendedTenants: suspended, 
      mrr: 0, 
      totalRevenue: 0 
    };
  }

  // 📊 STATISTIQUES INDIVIDUELLES (TENANT INSIGHTS)
  async getTenantStats(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} introuvable`);

    const [users, processes, docs, nc, audits] = await Promise.all([
      this.prisma.user.count({ where: { tenantId: id } }),
      this.prisma.processus.count({ where: { tenantId: id } }),
      this.prisma.document.count({ where: { tenantId: id } }),
      this.prisma.nonConformite.count({ where: { tenantId: id } }),
      this.prisma.audit.count({ where: { tenantId: id } }),
    ]);

    return { usersCount: users, processesCount: processes, documentsCount: docs, ncCount: nc, auditsCount: audits };
  }

  // 🏗️ CRÉATION (SCELLAGE DE NOUVEAU NŒUD)
  async create(dto: CreateTenantDto) {
    this.logger.log(`🏗️ Création d'instance souveraine : ${dto.T_Name}`);
    
    const forcedStatus = (dto as any).T_SubscriptionStatus || SubscriptionStatus.ACTIVE;
    const forcedPlan = (dto as any).T_Plan || Plan.ENTREPRISE;
    
    // Génération automatique du domaine si manquant
    const generatedDomain = dto.T_Domain || dto.T_Name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return this.prisma.tenant.create({
      data: { 
        ...dto, 
        T_Domain: generatedDomain,
        T_IsActive: true,
        T_SubscriptionStatus: forcedStatus as SubscriptionStatus,
        T_Plan: forcedPlan as Plan
      }
    });
  }

  // 📋 RÉCUPÉRATION (INDEX DE LA FÉDÉRATION)
  async findAll(includeArchived: boolean = false) {
    return this.prisma.tenant.findMany({
      where: includeArchived ? {} : { T_IsActive: true },
      orderBy: { T_CreatedAt: 'desc' },
      include: { _count: { select: { T_Users: true, T_Sites: true } } }
    });
  }

  // 📝 MISE À JOUR
  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await prisma.tenant.findUnique({ where: { T_Id: id } });
    if (!tenant) throw new NotFoundException('Instance inexistante');

    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: dto as any 
    });
  }

  // 📁 ARCHIVAGE
  async archive(id: string) {
    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: { T_IsActive: false, T_SubscriptionStatus: 'SUSPENDED' as any }
    });
  }
}