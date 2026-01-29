import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  // 🛠️ Suppression des placeholders "Method not implemented" qui causaient le crash

  async initiate(tenantId: string, userId: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      const steps = await Promise.all(
        dto.steps.map((s: any) =>
          tx.approvalWorkflow.create({
            data: {
              tenantId,
              AW_EntityType: dto.entityType,
              AW_EntityId: dto.entityId,
              AW_Step: s.order,
              AW_ApproverId: s.approverId || userId, // Sécurité si approverId est vide
              AW_Comment: s.label,
              // Seule la première étape est active au démarrage
              AW_Status: s.order === 1 ? WorkflowStatus.EN_ATTENTE : WorkflowStatus.REJETE,
            },
          })
        )
      );
      return steps;
    });
  }

  async process(tenantId: string, awId: string, userId: string, status: 'APPROUVE' | 'REJETE', comment: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.approvalWorkflow.findUnique({ where: { AW_Id: awId } });
      if (!current) throw new NotFoundException("Flux introuvable");

      // 1. Clôture de l'étape actuelle
      await tx.approvalWorkflow.update({
        where: { AW_Id: awId },
        data: { 
          AW_Status: status as WorkflowStatus, 
          AW_Comment: comment, 
          AW_ApprovedAt: new Date() 
        }
      });

      // 2. Si approuvé, on déverrouille l'étape suivante (AW_Step + 1)
      if (status === 'APPROUVE') {
        await tx.approvalWorkflow.updateMany({
          where: { 
            tenantId, 
            AW_EntityId: current.AW_EntityId, 
            AW_Step: current.AW_Step + 1 
          },
          data: { AW_Status: WorkflowStatus.EN_ATTENTE }
        });
      }
      return { success: true };
    });
  }

  async getTasks(tenantId: string, userId: string) {
    return this.prisma.approvalWorkflow.findMany({
      where: { 
        tenantId, 
        AW_ApproverId: userId, 
        AW_Status: WorkflowStatus.EN_ATTENTE 
      },
      orderBy: { AW_CreatedAt: 'desc' }
    });
  }
}