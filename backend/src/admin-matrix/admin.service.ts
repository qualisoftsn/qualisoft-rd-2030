/**
 * CHEMIN : /backend/src/admin-matrix/admin.service.ts
 * RÔLE : Service de lecture globale pour l'administration.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 📋 Récupère la liste de tous les tenants triés par date
   */
  async findAllTenants(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      orderBy: { T_CreatedAt: 'desc' },
      include: {
        _count: {
          select: { T_Users: true, T_Sites: true }
        }
      }
    });
  }
}