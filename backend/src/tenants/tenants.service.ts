/**
 * 🛰️ MODULE : TENANTS SERVICE (QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * RÔLE : Résolution dynamique des nœuds et gestion des instances.
 * FIX : Création de 'getPublicTenants' pour sécuriser les données.
 * RÉVISION : 07 Mars 2026 | 23:00 GMT
 * -------------------------------------------------------------------------
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Plan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🔓 RÉCUPÉRATION PUBLIQUE (SÉCURISÉE POUR LE LOGIN)
   * Ne renvoie que le strict minimum pour éviter les fuites de données (RGPD).
   */
  async getPublicTenants() {
    this.logger.log(`🔓 Extraction publique de la liste des nœuds actifs.`);
    return this.prisma.tenant.findMany({
      // where: { T_IsActive: true },
      select: {
        T_Id: true,
        T_Name: true,
        T_Domain: true,
      },
      orderBy: { T_Name: 'asc' }
    });
  }

  /**
   * 🔍 RÉCUPÉRATION DE LA CONFIGURATION
   */
  async getConfigBySlug(slug: string) {
    this.logger.log(`🔍 Reconnaissance du nœud Matrix : ${slug}`);

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        T_IsActive: true,
        OR: [
          { T_Domain: slug.toLowerCase() },
          { T_Domain: `${slug.toLowerCase()}.qualisoft.sn` }
        ]
      },
      include: {
        _count: {
          select: { T_Users: true, T_Processes: true }
        }
      }
    });

    if (!tenant) {
      this.logger.warn(`🛑 Échec : Nœud [${slug}] introuvable.`);
      throw new NotFoundException(`Le territoire ${slug} n'est pas activé.`);
    }

    return tenant;
  }

  // 📈 STATISTIQUES GLOBALES
  async getGlobalStats() {
    const [total, active, trial, suspended] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { T_IsActive: true, T_SubscriptionStatus: SubscriptionStatus.ACTIVE } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: SubscriptionStatus.TRIAL } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: 'SUSPENDED' as any } }),
    ]);

    return { totalTenants: total, activeTenants: active, trialTenants: trial, suspendedTenants: suspended, mrr: 0, totalRevenue: 0 };
  }

  // 📊 STATISTIQUES INDIVIDUELLES
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

  // 🏗️ CRÉATION (SCELLAGE)
  async create(dto: CreateTenantDto) {
    const forcedStatus = (dto as any).T_SubscriptionStatus || SubscriptionStatus.ACTIVE;
    const forcedPlan = (dto as any).T_Plan || Plan.ENTREPRISE;
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

  // 📋 RÉCUPÉRATION GLOBALE
  async findAll(includeArchived: boolean = false) {
    return this.prisma.tenant.findMany({
      where: includeArchived ? {} : { T_IsActive: true },
      orderBy: { T_CreatedAt: 'desc' },
      include: { _count: { select: { T_Users: true, T_Sites: true } } }
    });
  }

  // 📝 MISE À JOUR
  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: id } });
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