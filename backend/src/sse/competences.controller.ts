import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('competences')
export class CompetencesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('matrix')
  async getMatrix(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      throw new HttpException('TenantId est obligatoire pour l\'isolation des données', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. On ne récupère que les utilisateurs du Tenant
      const users = await this.prisma.user.findMany({
        where: { tenantId: tenantId },
        include: { U_Competences: true },
      });

      // 2. On ne récupère que les compétences créées pour ce Tenant
      const competences = await this.prisma.competence.findMany({
        where: { tenantId: tenantId }
      });

      return { users, competences };
    } catch (error) {
      throw new HttpException("Erreur lors de la récupération de la matrice", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Les autres méthodes (create, evaluate) doivent aussi utiliser le TenantId...
}