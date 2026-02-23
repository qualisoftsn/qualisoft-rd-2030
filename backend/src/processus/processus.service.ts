import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { ProcessFamily } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessusService {
  private readonly logger = new Logger(ProcessusService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🛡️ SOUVERAINETÉ : Détermine si l'utilisateur a les droits régaliens (RQ, Admin)
   */
  private isSouverain(user: any): boolean {
    const sovereignRoles = ['SUPER_ADMIN', 'ADMIN', 'RQ', 'DIRECTION'];
    const isMaster = user.U_Email === 'ab.thiongane@qualisoft.sn';
    return sovereignRoles.includes(user.U_Role) || isMaster;
  }

  /**
   * 🗺️ CARTOGRAPHIE : Liste des processus avec cloisonnement strict
   */
  async findAll(tenantId: string, user: any, family?: ProcessFamily) {
    const hasFullAccess = this.isSouverain(user);

    return this.prisma.processus.findMany({
      where: { 
        tenantId,
        PR_IsActive: true,
        // ÉTANCHÉITÉ : Si non souverain, on restreint à ses propres processus
        ...(!hasFullAccess ? {
          OR: [
            { PR_PiloteId: user.U_Id },
            { PR_CoPiloteId: user.U_Id }
          ]
        } : {}),
        ...(family ? { PR_Type: { PT_Family: family } } : {})
      },
      include: { 
        PR_Type: true, 
        PR_Pilote: { select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true } },
        _count: { select: { PR_Documents: true, PR_NonConformites: true, PR_PAQ: true } }
      },
      orderBy: { PR_Code: 'asc' }
    });
  }

  /**
   * 🚀 COCKPIT 360° : Agrégation de toutes les données du processus
   */
  async findOne(id: string, tenantId: string, user: any) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        PR_Type: true, 
        PR_Pilote: true,
        PR_CoPilote: true,
        // Données pour le module KPI
        PR_Indicators: { 
          include: { 
            IND_Values: { take: 12, orderBy: { IV_Year: 'desc' } } 
          } 
        },
        // Données pour le module RISQUES
        PR_Risks: { 
          where: { RS_IsActive: true },
          orderBy: { RS_Score: 'desc' } 
        },
        // Données pour le module GED
        PR_Documents: { 
          where: { DOC_IsActive: true, DOC_IsArchived: false },
          include: { DOC_Owner: { select: { U_LastName: true } } },
          take: 20
        },
        // Données pour le module ACTIONS (Avancement PAQ)
        PR_PAQ: {
          where: { PAQ_IsActive: true },
          orderBy: { PAQ_Year: 'desc' },
          take: 1,
          include: {
            PAQ_Actions: {
              where: { ACT_IsActive: true },
              include: { ACT_Responsable: { select: { U_LastName: true, U_FirstName: true } } }
            }
          }
        }
      }
    });

    if (!pr) throw new NotFoundException('Processus introuvable dans ce périmètre.');

    // VÉRIFICATION D'AUTORITÉ (§8.5.1)
    const isActor = pr.PR_PiloteId === user.U_Id || pr.PR_CoPiloteId === user.U_Id;
    if (!this.isSouverain(user) && !isActor) {
      throw new ForbiddenException("Accès restreint au cockpit : vous n'êtes ni Pilote ni RQ de ce processus.");
    }

    return pr;
  }

  /**
   * ✍️ INITIALISATION & MODIFICATION
   */
  async create(tenantId: string, dto: any) {
    try {
      return await this.prisma.processus.create({
        data: { 
          ...dto, 
          PR_Code: dto.PR_Code.toUpperCase().trim(), 
          tenantId 
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Le code processus existe déjà dans notre cartographie.');
      throw e;
    }
  }

  async update(id: string, tenantId: string, user: any, dto: any) {
    const pr = await this.prisma.processus.findFirst({ where: { PR_Id: id, tenantId } });
    if (!pr) throw new NotFoundException('Processus introuvable');

    // Seul le pilote ou un souverain peut modifier la structure
    if (!this.isSouverain(user) && pr.PR_PiloteId !== user.U_Id) {
      throw new ForbiddenException("Droit de modification réservé au Pilote titulaire.");
    }

    return this.prisma.processus.update({
      where: { PR_Id: id },
      data: { 
        ...dto,
        PR_Code: dto.PR_Code?.toUpperCase().trim(),
        PR_Version: { increment: 1 },
        PR_DateRevision: new Date()
      }
    });
  }

  async remove(id: string, tenantId: string, user: any) {
    const pr = await this.prisma.processus.findFirst({ where: { PR_Id: id, tenantId } });
    if (!pr) throw new NotFoundException('Processus introuvable');

    if (!this.isSouverain(user)) {
      throw new ForbiddenException("La suppression (archivage) de la cartographie est réservée au RQ.");
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
        _count: { 
          select: { 
            PR_Risks: true, 
            PR_NonConformites: true, 
            PR_Indicators: true, 
            PR_PAQ: true, 
            PR_Documents: true 
          } 
        } 
      }
    });
    
    if (!pr) throw new NotFoundException('Processus inexistant');
    return { 
      stats: pr._count, 
      healthScore: this.calculateHealth(pr._count),
      timestamp: new Date() 
    };
  }

  private calculateHealth(counts: any): number {
    // Logique simplifiée : Moins il y a de NC et plus il y a de PAQ/Docs, mieux c'est
    const base = 100;
    const penalty = (counts.PR_NonConformites * 10);
    return Math.max(0, Math.min(100, base - penalty));
  }
}