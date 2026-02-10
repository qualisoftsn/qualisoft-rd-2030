/**
 * 🏛️ APP MODULE : CŒUR DU SYSTÈME QUALISOFT ELITE
 * RÔLE : Orchestrateur principal. Il charge la configuration, la sécurité, 
 * et assemble tous les modules fonctionnels et techniques.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// ==================================================================================
// 1️⃣ INFRASTRUCTURE & NOYAU TECHNIQUE
// ==================================================================================
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { PkiModule } from './pki/pki.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './modules/stats/stats.module';
import { ArchivesModule } from './archives/archives.module'; // Chambre forte (Zéro suppression)
import { GenericCrudModule } from './common/generic-crud.module';

// ==================================================================================
// 2️⃣ SOUVERAINETÉ, IDENTITÉ & SÉCURITÉ (IAM)
// ==================================================================================
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AdminMatrixModule } from './admin-matrix/admin-matrix.module'; // ✅ REMPLACE L'ANCIEN AdminModule
import { MatrixModule } from './matrix/matrix.module'; // ✅ ACCÈS PUBLIC

// --- 🛡️ GARDES DE SÉCURITÉ (GUARDS) ---
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';

// ==================================================================================
// 3️⃣ ADMINISTRATION FONCTIONNELLE, SITES & FINANCES
// ==================================================================================
import { SitesModule } from './sites/sites.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { OrgUnitTypesModule } from './org-unit-types/org-unit-types.module';
import { GouvernanceModule } from './gouvernance/gouvernance.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SettingsController } from './settings/settings.controller';

// ==================================================================================
// 4️⃣ SMI CORE (ISO 9001 - LE CYCLE QUALITÉ)
// ==================================================================================
import { SmiModule } from './smi/smi.module';
import { ProcessusModule } from './processus/processus.module';
import { ProcessusTypeModule } from './processus-type/processus-type.module';
import { ActionsModule } from './actions/actions.module';
import { ActionsTabModule } from './actions-tab/actions-tab.module'; // Hub de pilotage
import { AuditsModule } from './audits/audits.module';
import { NonConformiteModule } from './non-conformites/non-conformites.module';
import { PaqModule } from './paq/paq.module';
import { ReclamationsModule } from './reclamations/reclamations.module';
import { TiersModule } from './tiers/tiers.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DocumentsModule } from './documents/documents.module';
import { QualityObjectivesModule } from './quality-objectives/quality-objectives.module';
import { ProcessReviewModule } from './process-review/process-review.module';
import { CopilModule } from './copil/copil.module';
import { RisksModule } from './risks/risks.module';
import { WorkflowModule } from './workflows/workflow.module';

// ==================================================================================
// 5️⃣ SMI SPÉCIALISÉ (SST, ENVIRONNEMENT, JURIDIQUE)
// ==================================================================================
import { SseModule } from './sse/sse.module';
import { SSEEventsModule } from './sse-events/sse-events.module';
import { EnvironmentModule } from './environment/environment.module';
import { ConsumptionsModule } from './consumptions/consumptions.module';
import { WastesModule } from './wastes/wastes.module';
import { AnalysesModule } from './analyses/analyses.module';
import { ExpositionModule } from './exposition/exposition.module';
import { IncidentsModule } from './incidents/incidents.module';
import { CauseriesModule } from './causeries/causeries.module';
import { SenegalLegalModule } from './senegal-legal/senegal-legal.module'; // Conformité locale

// ==================================================================================
// 6️⃣ CAPITAL HUMAIN & RESSOURCES
// ==================================================================================
import { CompetencesModule } from './competences/competences.module';
import { FormationsModule } from './formations/formations.module';
import { EquipmentModule } from './equipment/equipment.module';
import { MeetingsModule } from './meetings/meetings.module';
import { PartiesInteresseesModule } from './parties-interessees/parties-interessees.module';
import { ServicesModule } from './services/services.module';

// ==================================================================================
// 7️⃣ CONTRÔLEURS & SERVICES GLOBAUX
// ==================================================================================
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UploadController } from './common/upload.controller';
import { ContactService } from './auth/contact.service';

@Module({
  imports: [
    // 🌍 CONFIGURATION GLOBALE
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ScheduleModule.forRoot(), // Moteur de tâches planifiées (Cron)
    
    // 🧱 INFRASTRUCTURE
    PrismaModule,
    CommonModule,
    PkiModule,
    NotificationsModule,
    StatsModule,
    MulterModule.register({
      dest: './uploads', // Stockage temporaire avant transfert S3/MinIO ou Local
    }),

    // 🔑 IAM & SOUVERAINETÉ (Ordre critique)
    AuthModule,
    UsersModule,
    TenantsModule,
    AdminMatrixModule, // ✅ Module Super-Admin (Provisioning, Impersonation)
    MatrixModule,      // ✅ Module Public (Login Selectors)

    // 🏢 STRUCTURE & FINANCE
    SitesModule,
    OrgUnitsModule,
    OrgUnitTypesModule,
    GouvernanceModule,
    SubscriptionsModule,
    TransactionsModule,
    GenericCrudModule,

    // 🛠️ MÉTIER : QUALITÉ (ISO 9001)
    SmiModule,
    ProcessusModule,
    ProcessusTypeModule,
    AuditsModule,
    NonConformiteModule,
    ActionsModule,
    ActionsTabModule,
    PaqModule,
    TiersModule,
    ReclamationsModule,
    ProcessReviewModule,
    IndicatorsModule,
    DocumentsModule,
    QualityObjectivesModule,
    CopilModule,
    ArchivesModule,
    RisksModule,
    WorkflowModule,

    // 🌿 MÉTIER : HSE & JURIDIQUE (ISO 14001 / 45001)
    SseModule,
    SSEEventsModule,
    EnvironmentModule,
    ConsumptionsModule,
    WastesModule,
    AnalysesModule,
    ExpositionModule,
    IncidentsModule,
    CauseriesModule,
    SenegalLegalModule,

    // 👥 MÉTIER : RESSOURCES
    CompetencesModule,
    FormationsModule,
    EquipmentModule,
    MeetingsModule,
    PartiesInteresseesModule,
    ServicesModule,
  ],
  controllers: [
    AppController,
    SettingsController,
    UploadController,
    HealthController,
  ],
  providers: [
    AppService,
    ContactService,

    // 🛡️ SYSTÈME DE PROTECTION GLOBAL (Séquence d'exécution stricte)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Authentification : "Qui es-tu ?"
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard, // 2. Licence : "Ton instance est-elle active/payée ?"
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 3. Autorisation : "As-tu le droit d'être ici ?"
    },
  ],
})
export class AppModule {}