import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle exigence réglementaire
   */
  async create(dto: CreateRequirementDto, tenantId: string) {
    // Créer l'exigence
    const requirement = await this.prisma.regulatoryRequirement.create({
      data: {
        RR_Title: dto.RR_Title,
        // ✅ CORRECTION : Gestion de l'optionnel (undefined -> string vide)
        RR_Description: dto.RR_Description || '', 
        RR_Category: dto.RR_Category,
        RR_Type: dto.RR_Type,
        RR_Reference: dto.RR_Reference,
        RR_Authority: dto.RR_Authority,
        RR_DueDate: new Date(dto.RR_DueDate),
        RR_Frequency: dto.RR_Frequency,
        RR_Priority: dto.RR_Priority || 'MEDIUM',
        RR_IsRecurring: dto.RR_IsRecurring || false,
        tenantId
      }
    });

    // Créer une alerte de rappel automatiquement (7 jours avant)
    if (dto.createAlert !== false) {
      const alertDate = new Date(requirement.RR_DueDate);
      alertDate.setDate(alertDate.getDate() - 7);
      
      const now = new Date();
      // On ne crée l'alerte que si la date de rappel n'est pas déjà passée
      if (alertDate > now) {
        await this.prisma.alert.create({
          data: {
            AL_Title: `Rappel: ${requirement.RR_Title}`,
            AL_Message: `Rappel: L'exigence "${requirement.RR_Title}" arrive à échéance dans 7 jours (${new Date(requirement.RR_DueDate).toLocaleDateString('fr-FR')})`,
            AL_Type: 'REMINDER',
            AL_Priority: 'MEDIUM',
            AL_DueDate: requirement.RR_DueDate,
            AL_RequirementId: requirement.RR_Id,
            tenantId
          }
        });
      }
    }

    return requirement;
  }

  /**
   * Marquer une exigence comme conforme et gérer la récurrence
   */
  async markAsCompliant(id: string, evidenceUrl?: string) {
    const requirement = await this.prisma.regulatoryRequirement.findUnique({
      where: { RR_Id: id }
    });

    if (!requirement) throw new NotFoundException('Exigence non trouvée');

    // Mettre à jour le statut
    const updated = await this.prisma.regulatoryRequirement.update({
      where: { RR_Id: id },
      data: {
        RR_Status: 'COMPLIANT',
        RR_LastCompliance: new Date(),
        RR_EvidenceUrl: evidenceUrl
      }
    });

    // Si récurrent, créer la prochaine échéance
    if (requirement.RR_IsRecurring && requirement.RR_Frequency) {
      const nextDueDate = new Date(requirement.RR_DueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + requirement.RR_Frequency);
      
      await this.prisma.regulatoryRequirement.create({
        data: {
          RR_Title: requirement.RR_Title,
          // ✅ CORRECTION : Assurance que la description n'est pas null
          RR_Description: requirement.RR_Description || '', 
          RR_Category: requirement.RR_Category,
          RR_Type: requirement.RR_Type,
          RR_Reference: requirement.RR_Reference,
          RR_Authority: requirement.RR_Authority,
          RR_DueDate: nextDueDate,
          RR_Frequency: requirement.RR_Frequency,
          RR_Priority: requirement.RR_Priority,
          RR_IsRecurring: true,
          RR_Status: 'PENDING',
          tenantId: requirement.tenantId
        }
      });
    }

    return updated;
  }

  /**
   * Lister les exigences (avec filtre optionnel)
   */
  async getRequirements(tenantId: string, category?: string) {
    return this.prisma.regulatoryRequirement.findMany({
      where: {
        tenantId,
        RR_IsActive: true,
        ...(category && { RR_Category: category })
      },
      orderBy: { RR_DueDate: 'asc' }
    });
  }

  /**
   * Générer le calendrier de conformité unifié
   */
  async getComplianceCalendar(tenantId: string) {
    // Récupérer toutes les échéances (exigences + audits + formations)
    const [requirements, audits, formations] = await Promise.all([
      this.prisma.regulatoryRequirement.findMany({
        where: { tenantId, RR_IsActive: true, RR_Status: 'PENDING' },
        select: {
          RR_Id: true,
          RR_Title: true,
          RR_DueDate: true,
          RR_Category: true,
          RR_Type: true
        }
      }),
      this.prisma.audit.findMany({
        where: { tenantId, AU_Status: { in: ['PLANIFIE', 'EN_COURS'] } },
        select: {
          AU_Id: true,
          AU_Title: true,
          AU_DateAudit: true, // Assurez-vous que c'est le bon champ dans votre schéma
          AU_Type: true
        }
      }),
      this.prisma.formation.findMany({
        where: { tenantId, FOR_Expiry: { not: null } },
        select: {
          FOR_Id: true,
          FOR_Title: true,
          FOR_Expiry: true,
          FOR_UserId: true
        }
      })
    ]);

    // Formater pour le calendrier
    const events = [
      ...requirements.map(r => ({
        id: r.RR_Id,
        title: r.RR_Title,
        start: r.RR_DueDate,
        type: 'requirement',
        category: r.RR_Category,
        color: this.getRequirementColor(r.RR_Type, r.RR_DueDate)
      })),
      ...audits.map(a => ({
        id: a.AU_Id,
        title: a.AU_Title,
        start: a.AU_DateAudit,
        type: 'audit',
        category: a.AU_Type,
        color: '#3b82f6' // Bleu pour les audits
      })),
      ...formations.map(f => ({
        id: f.FOR_Id,
        title: f.FOR_Title,
        start: f.FOR_Expiry,
        type: 'formation',
        category: 'FORMATION',
        color: '#8b5cf6' // Violet pour les formations
      }))
    ];

    // ✅ Tri sécurisé des dates (évite l'erreur "possibly null")
    return events.sort((a, b) => {
      const timeA = a.start ? new Date(a.start).getTime() : 0;
      const timeB = b.start ? new Date(b.start).getTime() : 0;
      return timeA - timeB;
    });
  }

  /**
   * Helper pour déterminer la couleur en fonction de l'urgence
   */
  private getRequirementColor(type: string, dueDate: Date) {
    const daysLeft = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return '#ef4444'; // Rouge - En retard
    if (daysLeft <= 7) return '#f59e0b'; // Orange - Urgent
    if (daysLeft <= 30) return '#eab308'; // Jaune - À venir
    return '#10b981'; // Vert - OK
  }
}