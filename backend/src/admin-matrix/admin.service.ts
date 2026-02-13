/**
 * CHEMIN : /backend/src/admin-matrix/admin.service.ts
 * RÔLE : Service de lecture globale pour l'administration (Tenants, Stats...).
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 📋 Récupère la liste de tous les tenants (Scellés)
   * Inclut le comptage ISO 9001 (Utilisateurs et Sites)
   */
  async findAllTenants(): Promise<Tenant[]> {
    this.logger.log("🔍 [ADMIN] Lecture du registre global des tenants");
    
    return this.prisma.tenant.findMany({
      orderBy: { T_CreatedAt: 'desc' },
      include: {
        _count: {
          select: { 
            T_Users: true, 
            T_Sites: true 
          }
        }
      }
    });
  }
}