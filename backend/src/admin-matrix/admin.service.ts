import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Interface de transfert pour le registre Matrix (Frontend-safe)
 */
export interface TenantRegistryItem {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Plan: string;
  T_IsActive: boolean;
  _count: {
    T_Users: number;
  };
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scan complet du registre des nœuds déployés.
   */
  async findAllTenants(): Promise<TenantRegistryItem[]> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        select: {
          T_Id: true,
          T_Name: true,
          T_Domain: true,
          T_Plan: true,
          T_IsActive: true,
          _count: {
            select: { T_Users: true }
          }
        },
        orderBy: { T_CreatedAt: 'desc' }
      });
      
      return tenants as TenantRegistryItem[];
    } catch {
      this.logger.error("🚨 Échec du scan du registre Master.");
      throw new Error("Impossible de lire le registre des nœuds.");
    }
  }
}