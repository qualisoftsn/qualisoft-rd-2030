/**
 * CHEMIN : /backend/src/admin-matrix/admin.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Service de lecture et gestion du Registre Matrix (Public & Privé).
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 📋 [PRIVÉ] RÉCUPÉRATION DU REGISTRE COMPLET
   * Destiné au Dashboard Super-Admin (Routes protégées).
   * Inclut les statistiques d'utilisation ISO 9001.
   */
  async findAllTenants(): Promise<Tenant[]> {
    this.logger.log("🔍 [ADMIN] Lecture sécurisée du registre global");
    
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

  /**
   * 🔓 [PUBLIC] RÉCUPÉRATION DES ORGANISATIONS ACTIVES
   * Destiné à la page de LOGIN (Route publique).
   * Renvoie uniquement le strict nécessaire pour éviter les fuites de données.
   */
  async findAllPublic() {
    this.logger.log("📡 [PUBLIC] Lecture des entités pour le portail d'accès");
    
    return this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: {
        T_Id: true,
        T_Name: true,
        T_Domain: true,
        T_CeoName: true // Optionnel : utile pour l'accueil personnalisé
      },
      orderBy: { T_Name: 'asc' }
    });
  }

  /**
   * 🛰️ RECHERCHE PAR DOMAINE
   * Utile pour la fidélisation : sde.qualisoft.sn
   */
  async findByDomain(domain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Domain: domain },
      select: {
        T_Id: true,
        T_Name: true,
        T_Domain: true,
        T_IsActive: true
      }
    });

    if (!tenant) {
      throw new NotFoundException(`Le nœud Matrix [${domain}] est introuvable.`);
    }

    return tenant;
  }
}