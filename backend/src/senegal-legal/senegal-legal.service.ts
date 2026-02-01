import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalRequirementDto } from './dto/create-legal-requirement.dto';
import { ActionOrigin, ActionType, ActionStatus, Priority } from '@prisma/client';

@Injectable()
export class SenegalLegalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Création d'une exigence légale avec génération d'actions correctives
   * ISO 14001/45001 §6.1.3 - Obligations de conformité
   */
  async create(createDto: CreateLegalRequirementDto, tenantId: string, creatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Création de l'exigence légale
      // ✅ CORRECTION : On utilise SLR_Category pour matcher ton Schema Prisma actuel
      const requirement = await tx.senegalLegalRequirement.create({
        data: {
          SLR_Category: createDto.SLR_Category || 'SOCIAL', 
          SLR_Title: createDto.SLR_Title,
          SLR_Description: createDto.SLR_Description,
          SLR_Reference: createDto.SLR_Reference,
          SLR_Authority: createDto.SLR_Authority,
          SLR_Deadline: createDto.SLR_Deadline ? new Date(createDto.SLR_Deadline) : null,
          SLR_Status: createDto.SLR_Status || 'A_RESPECTER',
          SLR_Evidence: createDto.SLR_Evidence,
          SLR_Comment: createDto.SLR_Comment,
          SLR_IsActive: true,
          tenant: { connect: { T_Id: tenantId } }
        }
      });

      // 2. Récupération d'un PAQ par défaut pour le tenant
      const defaultPaq = await tx.pAQ.findFirst({
        where: { tenantId, PAQ_IsActive: true },
        orderBy: { PAQ_Year: 'desc' }
      });

      // 3. Création des actions associées
      if (createDto.actions && createDto.actions.length > 0) {
        if (!defaultPaq) {
          throw new BadRequestException("Aucun Plan d'Actions (PAQ) actif trouvé. Veuillez en créer un avant d'ajouter des actions légales.");
        }

        for (const actionDto of createDto.actions) {
          await tx.action.create({
            data: {
              ACT_Title: actionDto.ACT_Title,
              ACT_Description: `Conformité légale : ${requirement.SLR_Reference} - ${requirement.SLR_Title}`,
              ACT_Origin: ActionOrigin.LEGAL,
              ACT_Type: (actionDto.ACT_Type as ActionType) || ActionType.CORRECTIVE,
              ACT_Status: ActionStatus.A_FAIRE,
              ACT_Priority: Priority.HIGH,
              ACT_Deadline: actionDto.ACT_Deadline ? new Date(actionDto.ACT_Deadline) : null,
              ACT_ResponsableId: actionDto.ACT_ResponsableId,
              ACT_CreatorId: creatorId,
              ACT_LegalRequirementId: requirement.SLR_Id,
              ACT_PAQId: defaultPaq.PAQ_Id, // Relation PAQ obligatoire maintenue
              tenantId
            }
          });
        }
      }

      return requirement;
    });
  }

  /**
   * Récupération exhaustive avec inclusion des actions
   */
  async findAll(tenantId: string) {
    const [requirements, stats] = await Promise.all([
      this.prisma.senegalLegalRequirement.findMany({
        where: { tenantId, SLR_IsActive: true },
        include: {
          SLR_Actions: {
            where: { ACT_IsActive: true },
            include: { ACT_Responsable: true }
          }
        },
        orderBy: { SLR_CreatedAt: 'desc' }
      }),
      this.getComplianceStats(tenantId)
    ]);

    return { requirements, stats };
  }

  /**
   * Calcul des indicateurs de conformité légale (Heatmap & Taux)
   */
  async getComplianceStats(tenantId: string) {
    const requirements = await this.prisma.senegalLegalRequirement.findMany({
      where: { tenantId, SLR_IsActive: true },
      include: { 
        SLR_Actions: { 
          where: { ACT_IsActive: true } 
        } 
      }
    });

    const total = requirements.length;
    
    const byStatus = requirements.reduce((acc, r) => {
      acc[r.SLR_Status] = (acc[r.SLR_Status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ✅ CORRECTION : Utilisation de SLR_Category ici aussi
    const byCategory = requirements.reduce((acc, r) => {
      acc[r.SLR_Category] = (acc[r.SLR_Category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const compliant = byStatus['RESPECTEE'] || 0;
    const nonCompliant = byStatus['NON_CONFORME'] || 0;
    
    return {
      total,
      compliant,
      nonCompliant,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      byStatus,
      byCategory, 
      criticalCount: nonCompliant,
      actionsCount: requirements.flatMap(r => r.SLR_Actions).length
    };
  }

  /**
   * Mise à jour du statut avec validation de la preuve
   */
  async updateStatus(id: string, status: string, tenantId: string, evidence?: string) {
    const requirement = await this.prisma.senegalLegalRequirement.findFirst({
      where: { SLR_Id: id, tenantId, SLR_IsActive: true }
    });
    
    if (!requirement) throw new NotFoundException('Exigence légale non trouvée');
    
    if (status === 'RESPECTEE' && !evidence && !requirement.SLR_Evidence) {
      throw new BadRequestException('Une preuve est requise pour valider le respect de cette loi.');
    }

    return this.prisma.senegalLegalRequirement.update({
      where: { SLR_Id: id },
      data: { 
        SLR_Status: status,
        SLR_Evidence: evidence || requirement.SLR_Evidence,
        SLR_UpdatedAt: new Date()
      }
    });
  }

  /**
   * Rapport de veille réglementaire
   */
  async generateComplianceReport(tenantId: string) {
    const { requirements, stats } = await this.findAll(tenantId);
    const now = new Date();
    
    const criticalRequirements = requirements.filter(r => 
      r.SLR_Status === 'NON_CONFORME' || 
      (r.SLR_Deadline && new Date(r.SLR_Deadline) < now)
    );
    
    const upcomingDeadlines = requirements.filter(r => {
      if (!r.SLR_Deadline) return false;
      const d = new Date(r.SLR_Deadline);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      return d > now && d.getTime() < (now.getTime() + thirtyDays);
    });

    return {
      period: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      generationDate: now.toISOString(),
      summary: stats,
      criticalRequirements: criticalRequirements.map(r => ({
        id: r.SLR_Id,
        title: r.SLR_Title,
        category: r.SLR_Category, // ✅ CORRECTION
        authority: r.SLR_Authority,
        status: r.SLR_Status,
        deadline: r.SLR_Deadline
      })),
      upcomingDeadlines: upcomingDeadlines.map(r => ({
        id: r.SLR_Id,
        title: r.SLR_Title,
        deadline: r.SLR_Deadline,
        daysLeft: Math.ceil((new Date(r.SLR_Deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
      recommendations: [
        stats.nonCompliant > 0 ? `Traiter en urgence les ${stats.nonCompliant} non-conformités détectées.` : null,
        upcomingDeadlines.length > 0 ? `Anticiper les ${upcomingDeadlines.length} échéances légales du mois prochain.` : null,
        stats.complianceRate < 100 ? `Objectif : Atteindre 100% de conformité (Actuel: ${stats.complianceRate}%).` : "Excellente maîtrise réglementaire."
      ].filter(Boolean)
    };
  }
}