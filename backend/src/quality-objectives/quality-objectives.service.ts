import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQualityObjectiveDto } from './dto/create-quality-objective.dto';
import { UpdateQualityObjectiveDto } from './dto/update-quality-objective.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { QueryObjectivesDto } from './dto/query-objectives.dto';
import { ObjectiveStatus, Prisma } from '@prisma/client';
import { addMonths } from 'date-fns';

@Injectable()
export class QualityObjectivesService {
  private readonly logger = new Logger(QualityObjectivesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 📊 ANALYSE STATISTIQUE ISO 9001
   * Consolidation des indicateurs de performance pour le pilotage.
   */
  async getStats(tenantId: string) {
    const now = new Date();

    const [total, draft, active, achieved, failed, delayed, avgProgressAgg] = await Promise.all([
      this.prisma.qualityObjective.count({ where: { tenantId, QO_IsActive: true } }),
      this.prisma.qualityObjective.count({ where: { tenantId, QO_Status: ObjectiveStatus.BROUILLON, QO_IsActive: true } }),
      this.prisma.qualityObjective.count({ where: { tenantId, QO_Status: ObjectiveStatus.EN_COURS, QO_IsActive: true } }),
      this.prisma.qualityObjective.count({ where: { tenantId, QO_Status: ObjectiveStatus.ATTEINT, QO_IsActive: true } }),
      this.prisma.qualityObjective.count({ where: { tenantId, QO_Status: ObjectiveStatus.NON_ATTEINT, QO_IsActive: true } }),
      this.prisma.qualityObjective.count({ 
        where: { 
          tenantId, 
          QO_Status: ObjectiveStatus.EN_COURS, 
          QO_Deadline: { lt: now },
          QO_IsActive: true 
        } 
      }),
      this.prisma.qualityObjective.aggregate({
        where: { tenantId, QO_IsActive: true },
        _avg: { QO_Progress: true }
      })
    ]);

    return { 
      total, 
      draft, 
      active, 
      achieved, 
      failed, 
      delayed, 
      avgProgress: avgProgressAgg._avg.QO_Progress ?? 0 
    };
  }

  /**
   * 🔍 EXPLORATION DES OBJECTIFS
   * Moteur de recherche avec filtres de maturité et de processus.
   */
  async findAll(tenantId: string, query: QueryObjectivesDto) {
    const now = new Date();
    const thirtyDaysLater = addMonths(now, 1);
    
    const where: Prisma.QualityObjectiveWhereInput = { 
      tenantId, 
      QO_IsActive: true 
    };

    // Gestion du filtre status avec cast sécurisé pour éviter l'erreur "ALL" vs Enum
    if (query.status && (query.status as string) !== 'ALL') {
      where.QO_Status = query.status as ObjectiveStatus;
    }

    if (query.processus && (query.processus as string) !== 'ALL') {
      where.QO_ProcessusId = query.processus;
    }

    if (query.search) {
      const searchInput: Prisma.StringFilter = { contains: query.search, mode: 'insensitive' };
      where.OR = [
        { QO_Title: searchInput },
        { QO_Description: searchInput },
        { QO_Target: searchInput }
      ];
    }

    if (query.dateRange === 'overdue') {
      where.QO_Deadline = { lt: now };
      where.QO_Status = ObjectiveStatus.EN_COURS;
    } else if (query.dateRange === 'upcoming') {
      where.QO_Deadline = { gte: now, lte: thirtyDaysLater };
    }

    return this.prisma.qualityObjective.findMany({
      where,
      include: {
        QO_Processus: { select: { PR_Id: true, PR_Code: true, PR_Libelle: true } },
        QO_Owner: { select: { U_Id: true, U_FirstName: true, U_LastName: true } },
        QO_Indicators: { 
          select: { IND_Id: true, IND_Code: true, IND_Libelle: true, IND_Cible: true, IND_Unite: true }
        }
      },
      orderBy: { QO_CreatedAt: 'desc' }
    });
  }

  /**
   * 📄 CONSULTATION UNITAIRE
   */
  async findOne(id: string, tenantId: string) {
    const objective = await this.prisma.qualityObjective.findFirst({
      where: { QO_Id: id, tenantId, QO_IsActive: true },
      include: {
        QO_Processus: true,
        QO_Owner: { select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Email: true } },
        QO_Indicators: { include: { IND_Values: { orderBy: { IV_Year: 'desc' }, take: 12 } } }
      }
    });

    if (!objective) throw new NotFoundException("Objectif qualité introuvable");
    return objective;
  }

  /**
   * 🆕 CRÉATION (§6.2 ISO 9001)
   */
  async create(data: CreateQualityObjectiveDto, tenantId: string, creatorId: string) {
    try {
      return await this.prisma.qualityObjective.create({
        data: {
          QO_Title: data.QO_Title,
          QO_Description: data.QO_Description,
          QO_Target: data.QO_Target,
          QO_Deadline: new Date(data.QO_Deadline),
          QO_Status: data.QO_Status || ObjectiveStatus.BROUILLON,
          QO_Progress: data.QO_Progress || 0,
          QO_ProcessusId: data.QO_ProcessusId,
          QO_OwnerId: data.QO_OwnerId,
          tenantId,
          QO_IsActive: true
        }
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur création objectif: ${msg}`);
      throw new BadRequestException("Impossible de créer l'objectif qualité dans le Noyau");
    }
  }

  /**
   * ✏️ RÉVISION STRATÉGIQUE
   */
  async update(id: string, data: UpdateQualityObjectiveDto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);
    
    const updateData: Prisma.QualityObjectiveUpdateInput = {
      ...data,
      QO_Deadline: data.QO_Deadline ? new Date(data.QO_Deadline) : undefined,
      QO_UpdatedAt: new Date()
    };

    if (data.QO_Status === ObjectiveStatus.ATTEINT) {
      updateData.QO_Progress = 100;
    }

    return this.prisma.qualityObjective.update({
      where: { QO_Id: id },
      data: updateData
    });
  }

  /**
   * 📈 MISE À JOUR DE LA MATURITÉ
   * Résolution de l'erreur TS2345 par typage explicite de la collection de comparaison.
   */
  async updateProgress(id: string, dto: UpdateProgressDto, tenantId: string) {
    const objective = await this.findOne(id, tenantId);
    
    // Définition explicite des statuts de clôture pour autoriser la comparaison stricte
    const closedStatuses: ObjectiveStatus[] = [
      ObjectiveStatus.ATTEINT, 
      ObjectiveStatus.ANNULE, 
      ObjectiveStatus.NON_ATTEINT
    ];

    if (closedStatuses.includes(objective.QO_Status)) {
      throw new BadRequestException("Modification impossible : l'objectif est clôturé ou archivé.");
    }

    let newStatus: ObjectiveStatus = objective.QO_Status;
    
    if (dto.progress >= 100) {
      newStatus = ObjectiveStatus.ATTEINT;
    } else if (dto.progress > 0 && objective.QO_Status === ObjectiveStatus.BROUILLON) {
      newStatus = ObjectiveStatus.EN_COURS;
    }

    return this.prisma.qualityObjective.update({
      where: { QO_Id: id },
      data: { 
        QO_Progress: dto.progress, 
        QO_Status: newStatus, 
        QO_UpdatedAt: new Date() 
      }
    });
  }

  /**
   * 🔄 TRANSITION DE STATUT
   */
  async updateStatus(id: string, status: ObjectiveStatus, tenantId: string, comment?: string) {
    await this.findOne(id, tenantId);

    const updateData: Prisma.QualityObjectiveUpdateInput = {
      QO_Status: status,
      QO_UpdatedAt: new Date()
    };

    if (status === ObjectiveStatus.ATTEINT) updateData.QO_Progress = 100;
    if (status === ObjectiveStatus.BROUILLON) updateData.QO_Progress = 0;

    return this.prisma.qualityObjective.update({
      where: { QO_Id: id },
      data: updateData
    });
  }

  /**
   * 🗑️ ARCHIVAGE (Soft Delete)
   */
  async remove(id: string, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.qualityObjective.update({
      where: { QO_Id: id },
      data: { 
        QO_IsActive: false, 
        QO_UpdatedAt: new Date() 
      }
    });
  }

  /**
   * 🔗 ALIGNEMENT INDICATEURS
   */
  async linkIndicator(objectiveId: string, indicatorId: string, tenantId: string) {
    await this.findOne(objectiveId, tenantId);

    return this.prisma.indicator.update({
      where: { IND_Id: indicatorId },
      data: { IND_ObjectiveId: objectiveId }
    });
  }
}