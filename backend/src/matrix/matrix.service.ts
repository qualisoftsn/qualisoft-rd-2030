/**
 * 🛰️ MODULE : MATRIX KERNEL SERVICE
 * -------------------------------------------------------------------------
 * CHEMIN : /backend/src/matrix/matrix.service.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Moteur souverain (Lecture, Incarnation, Enrôlement).
 * FIX : Ajout de la méthode findPublicUsersByTenant requise par le contrôleur.
 * DATE : 01 Mars 2026 | HEURE : 23:45 (GMT)
 * -------------------------------------------------------------------------
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MatrixService {
  private readonly logger = new Logger(MatrixService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 📋 1. REGISTRE COMPLET (CONSOLE MASTER)
   * Extraction de tous les nœuds avec agrégations de ressources.
   */
  async findAllTenants() {
    try {
      return await this.prisma.tenant.findMany({
        include: { 
          _count: { 
            select: { T_Users: true, T_Sites: true } 
          } 
        },
        orderBy: { T_CreatedAt: 'desc' }
      });
    } catch (error) {
      this.logger.error("❌ Échec lecture registre global Matrix", error);
      throw new Error("Base Matrix inaccessible.");
    }
  }

  /**
   * 🔍 2. DÉTAILS PROFONDS D'UN NŒUD
   * Analyse complète d'une instance spécifique pour audit master.
   */
  async getTenantDetails(id: string) {
    if (id === 'deploy') return null;
    
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: id },
      include: {
        T_Users: { orderBy: { U_CreatedAt: 'desc' } },
        _count: { select: { T_Users: true, T_Sites: true } }
      }
    });

    if (!tenant) throw new NotFoundException("Nœud Matrix introuvable.");
    return tenant;
  }

  /**
   * 🎭 3. PROTOCOLE D'INCARNATION (IMPERSONATION)
   * Génération d'un pont JWT sécurisé vers un compte administrateur local.
   */
  async impersonate(tenantId: string) {
    const targetUser = await this.prisma.user.findFirst({
      where: { tenantId, U_Role: 'ADMIN', U_IsActive: true },
      include: { tenant: true }
    });

    if (!targetUser) {
      throw new NotFoundException("Aucun compte racine actif trouvé sur ce nœud.");
    }

    const payload = { 
      U_Id: targetUser.U_Id, 
      U_Email: targetUser.U_Email, 
      tenantId: targetUser.tenantId, 
      U_Role: targetUser.U_Role 
    };

    this.logger.warn(`🎭 TUNNEL : Incarnation Master vers [${targetUser.tenant.T_Name}]`);

    return {
      token: this.jwtService.sign(payload),
      user: {
        U_Id: targetUser.U_Id, 
        U_FirstName: targetUser.U_FirstName, 
        U_LastName: targetUser.U_LastName,
        U_Email: targetUser.U_Email, 
        U_Role: targetUser.U_Role, 
        tenantId: targetUser.tenantId, 
        U_TenantName: targetUser.tenant.T_Name
      }
    };
  }

  /**
   * 👤 4. ENRÔLEMENT EXTERNE (INITIALISATION)
   * Création forcée d'un utilisateur racine lors du provisioning.
   */
  async createUserForTenant(tenantId: string, data: any) {
    // Hashage conforme aux standards Qualisoft
    const passwordHash = await bcrypt.hash(data.password || "Qualisoft@2026", 10);
    
    // Récupération du site par défaut pour rattachement structurel
    const defaultSite = await this.prisma.site.findFirst({ where: { tenantId } });

    return await this.prisma.user.create({
      data: {
        U_Email: data.U_Email.toLowerCase().trim(),
        U_FirstName: data.U_FirstName, 
        U_LastName: data.U_LastName,
        U_PasswordHash: passwordHash, 
        U_Role: data.U_Role,
        tenantId: tenantId, 
        U_SiteId: defaultSite?.S_Id || null,
        U_IsActive: true, 
        U_FirstLogin: true
      }
    });
  }

  /**
   * 🔓 5. LECTURE PUBLIQUE (SÉLECTEUR LOGIN)
   * Mise à disposition des identités visuelles pour le portail d'entrée.
   */
  async findPublicTenants() {
    return await this.prisma.tenant.findMany({
      where: { T_IsActive: true },
      select: { 
        T_Id: true, 
        T_Name: true, 
        T_Domain: true, 
        T_CeoName: true 
      },
      orderBy: { T_Name: 'asc' }
    });
  }

  /**
   * 🔓 6. LECTURE PUBLIQUE DES UTILISATEURS
   * Récupère la liste sécurisée des utilisateurs d'un Tenant spécifique (Login).
   */
  async findPublicUsersByTenant(tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException("Identifiant d'instance requis.");
    }

    return await this.prisma.user.findMany({
      where: { 
        tenantId: tenantId,
        U_IsActive: true 
      },
      // Sécurité : On ne sélectionne QUE les champs non sensibles
      select: {
        U_Id: true,
        U_Email: true,
        U_FirstName: true,
        U_LastName: true,
        U_Role: true
      },
      orderBy: { U_FirstName: 'asc' }
    });
  }
}