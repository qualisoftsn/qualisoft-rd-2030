import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Noyau PostgreSQL Qualisoft synchronisé avec succès');
    } catch (error) {
      this.logger.error('🚨 Échec de connexion à la base de données');
      throw error;
    }

    // Middleware de sécurité contre les écritures massives (Générique)
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      if (['deleteMany', 'updateMany'].includes(params.action)) {
        if (!params.args.where || Object.keys(params.args.where).length === 0) {
          throw new Error(`Sécurité : Action ${params.action} sur ${params.model} bloquée (filtre manquant).`);
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('⚠️ Déconnexion sécurisée du service Prisma');
  }
}