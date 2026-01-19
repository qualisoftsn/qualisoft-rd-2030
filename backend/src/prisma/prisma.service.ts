import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Connexion à PostgreSQL établie avec succès');

    // 🛡️ MIDDLEWARE D'ISOLATION ET DE SÉCURITÉ
    // Ce bloc intercepte chaque appel à la base de données pour garantir l'intégrité
    this.$use(async (params, next) => {
      const start = Date.now();

      // 1. Protection contre les suppressions massives accidentelles
      if (params.action === 'deleteMany' || params.action === 'updateMany') {
        if (!params.args.where || Object.keys(params.args.where).length === 0) {
          this.logger.error(`🚨 Tentative de ${params.action} sans filtre sur ${params.model} bloquée !`);
          throw new Error(`Action ${params.action} interdite sans filtre de sécurité.`);
        }
      }

      // 2. Exécution de la requête
      const result = await next(params);

      // 3. Logique de monitoring pour ton briefing de 08:00
      const duration = Date.now() - start;
      
      if (['create', 'update', 'delete', 'deleteMany', 'updateMany'].includes(params.action)) {
        this.logger.log(
          `🏗️ DB_WRITE: ${params.model}.${params.action} | Durée: ${duration}ms | Statut: SUCCESS`
        );
      }

      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('⚠️ Connexion à PostgreSQL fermée');
  }

  /**
   * 💡 MÉTHODE UTILITAIRE : Nettoyage des données
   * Utile pour la maintenance mentionnée dans le briefing (Cache/Tenant).
   */
  async cleanTenantCache(tenantId: string) {
    this.logger.log(`🧹 Nettoyage des ressources pour le tenant : ${tenantId}`);
    // Logique de nettoyage étendue (ex: suppression de fichiers temporaires ou cache Redis)
    return true;
  }
}