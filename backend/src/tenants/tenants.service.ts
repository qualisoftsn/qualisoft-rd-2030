import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) {}

  // 📈 STATISTIQUES GLOBALES (Résout le 404 du Header Super Admin)
  async getGlobalStats() {
    this.logger.log('📊 Agrégation des KPIs du cluster Qualisoft');
    
    const [total, active, trial, suspended] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { T_IsActive: true, T_SubscriptionStatus: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: 'TRIAL' } }),
      this.prisma.tenant.count({ where: { T_SubscriptionStatus: 'SUSPENDED' } }),
    ]);

    // Calcul du MRR (Revenu Mensuel Récurrent) basé sur les plans actifs
    const activeTenants = await this.prisma.tenant.findMany({
      where: { T_SubscriptionStatus: 'ACTIVE' },
      select: { T_Plan: true }
    });

    const planPrices = { 
      ESSAI: 0, 
      EMERGENCE: 55000, 
      CROISSANCE: 105000, 
      ENTREPRISE: 175000, 
      GROUPE: 350000 
    };

    const mrr = activeTenants.reduce((acc, curr) => acc + (planPrices[curr.T_Plan] || 0), 0);

    return {
      totalTenants: total,
      activeTenants: active,
      trialTenants: trial,
      suspendedTenants: suspended,
      mrr: mrr,
      totalRevenue: mrr * 12 // Projection annuelle
    };
  }

  // 📊 STATISTIQUES INDIVIDUELLES (Résout le 404 lors du dépliage d'un Tenant)
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

    return {
      usersCount: users,
      processesCount: processes,
      documentsCount: docs,
      ncCount: nc,
      auditsCount: audits
    };
  }

  // 🏗️ CRÉATION (Phase 1 du déploiement)
  async create(dto: CreateTenantDto) {
    this.logger.log(`🏗️ Création de l'instance organisationnelle : ${dto.T_Name}`);
    return this.prisma.tenant.create({
      data: { 
        ...dto, 
        T_IsActive: true,
        T_SubscriptionStatus: dto.T_ContractDuration === 12 ? 'TRIAL' : 'ACTIVE'
      }
    });
  }

  // 📋 RÉCUPÉRATION (Inclusion des compteurs Prisma)
  async findAll(includeArchived: boolean = false) {
    return this.prisma.tenant.findMany({
      where: includeArchived ? {} : { T_IsActive: true },
      orderBy: { T_CreatedAt: 'desc' },
      include: {
        _count: { 
          select: { T_Users: true, T_Sites: true } 
        }
      }
    });
  }

  // 📝 MISE À JOUR
  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: id } });
    if (!tenant) throw new NotFoundException('Instance inexistante');

    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: dto
    });
  }

  // 📁 ARCHIVAGE (Soft Delete)
  async archive(id: string) {
    this.logger.warn(`📁 Archivage sécurisé de l'instance ID: ${id}`);
    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: { T_IsActive: false, T_SubscriptionStatus: 'SUSPENDED' }
    });
  }
}