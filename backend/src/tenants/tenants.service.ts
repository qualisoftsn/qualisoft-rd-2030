import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Plan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) {}

  // 📈 STATISTIQUES GLOBALES
  async getGlobalStats() {
    this.logger.log('📊 Agrégation des KPIs du cluster Qualisoft');
    
    const [total, active, trial, suspended] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { T_IsActive: true, T_SubscriptionStatus: SubscriptionStatus.ACTIVE } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: SubscriptionStatus.TRIAL } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: 'SUSPENDED' as any } }),
    ]);

    const activeTenants = await this.prisma.tenant.findMany({
      where: { T_SubscriptionStatus: SubscriptionStatus.ACTIVE },
      select: { T_Plan: true }
    });

    // Estimation des revenus (MRR)
    const planPrices = { ESSAI: 0, EMERGENCE: 55000, CROISSANCE: 105000, ENTREPRISE: 175000, GROUPE: 350000 };
    const mrr = activeTenants.reduce((acc, curr) => acc + (planPrices[curr.T_Plan] || 0), 0);

    return { totalTenants: total, activeTenants: active, trialTenants: trial, suspendedTenants: suspended, mrr, totalRevenue: mrr * 12 };
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

  // 🏗️ CRÉATION (Le cœur du problème résolu ici)
  async create(dto: CreateTenantDto) {
    this.logger.log(`🏗️ Création de l'instance organisationnelle : ${dto.T_Name}`);
    
    // 1. On force les valeurs par défaut (ACTIVE / ENTREPRISE)
    // Le (dto as any) empêche TypeScript de râler si le champ n'est pas dans le DTO strict
    const forcedStatus = (dto as any).T_SubscriptionStatus || SubscriptionStatus.ACTIVE;
    const forcedPlan = (dto as any).T_Plan || Plan.ENTREPRISE;

    // 2. Génération automatique du domaine technique si absent
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

  // 📋 RÉCUPÉRATION
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
      data: dto as any // 👈 Le "Joker" pour que ça passe
    });
  }

  // 📁 ARCHIVAGE
  async archive(id: string) {
    this.logger.warn(`📁 Archivage sécurisé de l'instance ID: ${id}`);
    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: { T_IsActive: false, T_SubscriptionStatus: 'SUSPENDED' as any }
    });
  }
}