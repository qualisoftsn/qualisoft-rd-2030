import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException, 
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaqService {
  constructor(private prisma: PrismaService) {}

  /** ✅ DASHBOARD : Analyse d'efficacité (Correction du type enRetard) */
  async getDashboard(T_Id: string) {
    if (!T_Id) throw new UnauthorizedException("Identifiant entreprise manquant.");

    const today = new Date();
    
    // Récupération de toutes les actions pour les calculs
    const actions = await this.prisma.action.findMany({
      where: { tenantId: T_Id },
      include: { 
        ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
      },
    });

    // ✅ CORRECTION : On renvoie le TABLEAU filtré pour que le .slice() fonctionne en Frontend
    const enRetard = actions.filter(a => 
      a.ACT_Status !== 'TERMINEE' && 
      a.ACT_Deadline && 
      new Date(a.ACT_Deadline) < today
    );

    const cloturees = actions.filter(a => a.ACT_Status === 'TERMINEE');

    // Calcul de la charge par pilote
    const chargeMap = new Map<string, number>();
    actions.forEach(a => {
      if (a.ACT_Status !== 'TERMINEE' && a.ACT_Responsable) {
        const name = `${a.ACT_Responsable.U_FirstName?.[0] || ''}. ${a.ACT_Responsable.U_LastName || 'Inconnu'}`.toUpperCase();
        chargeMap.set(name, (chargeMap.get(name) || 0) + 1);
      }
    });

    return {
      total: actions.length,
      enRetard: enRetard, // Renvoie l'Array d'objets Action
      cloturees: cloturees.length,
      chargeTravail: Array.from(chargeMap.entries()),
      tauxEfficacite: actions.length > 0 ? (cloturees.length / actions.length) * 100 : 0
    };
  }

  /** ✅ MISE À JOUR D'UNE ACTION (Débloque la modification réclamée) */
  async updateAction(id: string, T_Id: string, data: any) {
    const existing = await this.prisma.action.findFirst({
      where: { ACT_Id: id, tenantId: T_Id }
    });
    if (!existing) throw new NotFoundException("Action introuvable.");

    return this.prisma.action.update({
      where: { ACT_Id: id },
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: data.ACT_Status,
        ACT_Priority: data.ACT_Priority,
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : null,
        ACT_ResponsableId: data.ACT_ResponsableId
      }
    });
  }

  /** ✅ CRÉATION D'UN PAQ */
  async create(data: any, T_Id: string) {
    if (!data.PAQ_ProcessusId || !data.PAQ_QualityManagerId) {
      throw new BadRequestException("Processus et Manager obligatoires.");
    }
    const year = parseInt(data.PAQ_Year) || new Date().getFullYear();

    try {
      return await this.prisma.pAQ.create({
        data: {
          PAQ_Title: data.PAQ_Title,
          PAQ_Description: data.PAQ_Description || "",
          PAQ_Year: year,
          tenantId: T_Id,
          PAQ_ProcessusId: data.PAQ_ProcessusId,
          PAQ_QualityManagerId: data.PAQ_QualityManagerId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException(`PAQ déjà existant pour ce processus cette année.`);
      throw new InternalServerErrorException("Erreur serveur lors de la création.");
    }
  }

  async findAll(T_Id: string) {
    return this.prisma.pAQ.findMany({
      where: { tenantId: T_Id },
      include: {
        PAQ_Processus: true,
        PAQ_QualityManager: { select: { U_FirstName: true, U_LastName: true } },
        _count: { select: { PAQ_Actions: true } }
      },
      orderBy: { PAQ_Year: 'desc' }
    });
  }

  async findOne(id: string, T_Id: string) {
    const paq = await this.prisma.pAQ.findFirst({
      where: { PAQ_Id: id, tenantId: T_Id },
      include: {
        PAQ_Actions: { include: { ACT_Responsable: true } },
        PAQ_Processus: true,
        PAQ_QualityManager: true
      }
    });
    if (!paq) throw new NotFoundException("PAQ introuvable.");
    return paq;
  }
}