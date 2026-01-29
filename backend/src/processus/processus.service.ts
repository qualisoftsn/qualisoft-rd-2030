import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskStatus, ProcessFamily } from '@prisma/client';

@Injectable()
export class ProcessusService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper : Vérifie si l'utilisateur est un profil de direction/qualité
   */
  private isSouverain(user: any): boolean {
    const sovereignRoles = ['SUPER_ADMIN', 'ADMIN', 'RQ'];
    const isMasterEmail = user.U_Email === 'ab.thiongane@qualisoft.sn';
    return sovereignRoles.includes(user.U_Role) || isMasterEmail;
  }

  /**
   * Récupère les processus autorisés (§4.4)
   * Pour un Pilote, ne renverra qu'un seul élément dans le tableau.
   */
  async findAll(tenantId: string, user: any, family?: ProcessFamily) {
    const isGlobal = this.isSouverain(user);

    return this.prisma.processus.findMany({
      where: { 
        tenantId,
        PR_IsActive: true,
        // ÉTANCHÉITÉ : Si non souverain, on limite strictement à l'affectation
        ...(!isGlobal ? {
          OR: [
            { PR_PiloteId: user.U_Id },
            { PR_CoPiloteId: user.U_Id }
          ]
        } : {}),
        ...(family ? { PR_Type: { PT_Family: family } } : {})
      },
      include: { 
        PR_Type: true, 
        PR_Pilote: { select: { U_Id: true, U_FirstName: true, U_LastName: true } },
        PR_CoPilote: { select: { U_Id: true, U_FirstName: true, U_LastName: true } }
      },
      orderBy: { PR_Code: 'asc' }
    });
  }

  /**
   * Vue Cockpit 360° - Bloque l'accès si l'utilisateur n'est pas lié au processus
   */
  async findOne(id: string, tenantId: string, user: any) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        PR_Type: true, 
        PR_Pilote: true,
        PR_CoPilote: true,
        PR_Indicators: { include: { IND_Values: { take: 12, orderBy: { IV_Year: 'desc' } } } },
        PR_Risks: { where: { RS_Status: RiskStatus.SURVEILLE } },
        PR_Documents: { where: { DOC_IsActive: true } },
        PR_PAQ: {
          where: { PAQ_IsActive: true },
          include: {
            PAQ_Actions: {
              where: { ACT_IsActive: true },
              include: { ACT_Responsable: { select: { U_LastName: true, U_FirstName: true } } }
            }
          }
        }
      }
    });

    if (!pr) throw new NotFoundException('Processus introuvable');

    // VÉRIFICATION DE PROPRIÉTÉ
    const isOwner = pr.PR_PiloteId === user.U_Id || pr.PR_CoPiloteId === user.U_Id;
    if (!this.isSouverain(user) && !isOwner) {
      throw new ForbiddenException("Accès restreint à votre propre cockpit de processus.");
    }

    return pr;
  }

  async create(tenantId: string, dto: any) {
    try {
      return await this.prisma.processus.create({
        data: { ...dto, PR_Code: dto.PR_Code.toUpperCase().trim(), tenantId }
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Le code processus existe déjà');
      throw e;
    }
  }

  async update(id: string, tenantId: string, user: any, dto: any) {
    const pr = await this.prisma.processus.findFirst({ where: { PR_Id: id, tenantId } });
    if (!pr) throw new NotFoundException('Processus introuvable');

    if (!this.isSouverain(user) && pr.PR_PiloteId !== user.U_Id) {
      throw new ForbiddenException("Vous n'avez pas l'autorité pour modifier ce processus.");
    }

    return this.prisma.processus.update({
      where: { PR_Id: id },
      data: { 
        ...dto,
        PR_Code: dto.PR_Code?.toUpperCase().trim(),
      }
    });
  }

  async remove(id: string, tenantId: string, user: any) {
    const pr = await this.prisma.processus.findFirst({ where: { PR_Id: id, tenantId } });
    if (!pr) throw new NotFoundException('Processus introuvable');

    if (!this.isSouverain(user) && pr.PR_PiloteId !== user.U_Id) {
      throw new ForbiddenException("Droit d'archivage réservé au Pilote ou au RQ.");
    }

    return this.prisma.processus.update({
      where: { PR_Id: id },
      data: { PR_IsActive: false }
    });
  }

  async getAnalytics(id: string, tenantId: string) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        _count: { select: { PR_Risks: true, PR_NonConformites: true, PR_Indicators: true, PR_PAQ: true, PR_Documents: true } } 
      }
    });
    if (!pr) throw new NotFoundException('Processus introuvable');
    return { stats: pr._count, timestamp: new Date() };
  }
}