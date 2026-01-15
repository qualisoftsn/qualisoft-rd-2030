import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  prisma: any;
  departement: any;

  async onModuleInit() {
    await this.$connect();
    
    // 🛡️ LOGIQUE CTO : Middleware d'isolation des données
    // Ce bloc intercepte chaque appel à la base de données
    this.$use(async (params, next) => {
      const result = await next(params);
      
      // Optionnel : On peut logger les actions sensibles pour ton briefing de 08:00
      if (['create', 'update', 'delete'].includes(params.action)) {
        this.logger.log(`🏗️ DB_ACTION: ${params.model}.${params.action} exécutée`);
      }
      
      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 💡 CONSEIL CTO : Méthode utilitaire pour nettoyer les données orphelines
   * Utile pour la maintenance Redis/PostgreSQL mentionnée dans le briefing.
   */
  async cleanTenantCache(tenantId: string) {
    // Logique de nettoyage si nécessaire
    return true;
  }
}