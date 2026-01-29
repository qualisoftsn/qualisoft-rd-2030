// File: backend/src/formations/formations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère toutes les formations du Tenant (§7.2 ISO 9001)
   */
  async findAll(tenantId: string) {
    return this.prisma.formation.findMany({
      where: { 
        tenantId,
        FOR_IsActive: true 
      },
      include: {
        FOR_User: {
          select: {
            U_FirstName: true,
            U_LastName: true,
            U_Role: true,
            U_OrgUnit: { select: { OU_Name: true } }
          }
        }
      },
      orderBy: { FOR_Date: 'desc' }
    });
  }

  /**
   * Initialise une nouvelle ligne au plan de formation
   */
  async create(tenantId: string, userId: string, data: any) {
    return this.prisma.formation.create({
      data: {
        ...data,
        tenantId,
        FOR_UserId: data.FOR_UserId || userId, // Par défaut le créateur si non spécifié
        FOR_Status: data.FOR_Status || 'PLANIFIE'
      }
    });
  }

  /**
   * Mise à jour d'une session (Status, Date, Expiration)
   */
  async update(tenantId: string, id: string, data: any) {
    const exists = await this.prisma.formation.findFirst({
      where: { FOR_Id: id, tenantId }
    });

    if (!exists) throw new NotFoundException("Instance de formation introuvable");

    return this.prisma.formation.update({
      where: { FOR_Id: id },
      data
    });
  }

  /**
   * Archivage logique (Traçabilité normative)
   */
  async remove(tenantId: string, id: string) {
    return this.prisma.formation.updateMany({
      where: { FOR_Id: id, tenantId },
      data: { FOR_IsActive: false }
    });
  }

  /**
   * Surveillance des recyclages critiques
   */
  async getAlerts(tenantId: string) {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + 1);

    return this.prisma.formation.findMany({
      where: {
        tenantId,
        FOR_Expiry: { lte: threshold },
        FOR_IsActive: true,
        FOR_Status: 'TERMINE'
      },
      include: { FOR_User: true }
    });
  }
}