/**
 * 🏛️ APP MODULE : NOYAU CENTRAL QUALISOFT ELITE RD 2030
 * --------------------------------------------------------------------------
 * RÔLE : Orchestrateur Suprême du Système.
 * FONCTION : Centralisation de l'Infrastructure, Sécurité Multi-Tenant,
 * et Pilotage des Modules Métiers (SMI & HSE).
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// --- 1. INFRASTRUCTURE & NOYAU TECHNIQUE ---
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { PkiModule } from './pki/pki.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatsModule } from './modules/stats/stats.module';
import { ArchivesModule } from './archives/archives.module'; 
import { GenericCrudModule } from './common/generic-crud.module';

// --- 2. IAM : IDENTITÉ & SOUVERAINETÉ ---
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AdminMatrixModule } from './admin-matrix/admin-matrix.module'; 
import { MatrixModule } from './matrix/matrix.module'; 

// --- 3. STRUCTURE, FINANCES & SITES ---
import { SitesModule } from './sites/sites.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { OrgUnitTypesModule } from './org-unit-types/org-unit-types.module';
import { GouvernanceModule } from './gouvernance/gouvernance.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';

// --- 4. SMI CORE : ISO 9001 (Le Cycle Qualité) ---
import { SmiModule } from './smi/smi.module';
import { ProcessusModule } from './processus/processus.module';
import { ProcessusTypeModule } from './processus-type/processus-type.module';
import { ActionsModule } from './actions/actions.module';
import { ActionsTabModule } from './actions-tab/actions-tab.module';
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

// --- 5. SMI SPÉCIALISÉ : HSE (ISO 14001 / 45001) ---
import { SseModule } from './sse/sse.module';
import { SSEEventsModule } from './sse-events/sse-events.module';
import { EnvironmentModule } from './environment/environment.module';
import { ConsumptionsModule } from './consumptions/consumptions.module';
import { WastesModule } from './wastes/wastes.module';
import { AnalysesModule } from './analyses/analyses.module';
import { ExpositionModule } from './exposition/exposition.module';
import { IncidentsModule } from './incidents/incidents.module';
import { CauseriesModule } from './causeries/causeries.module';
import { SenegalLegalModule } from './senegal-legal/senegal-legal.module';

// --- 6. CAPITAL HUMAIN & RESSOURCES ---
import { CompetencesModule } from './competences/competences.module';
import { FormationsModule } from './formations/formations.module';
import { EquipmentModule } from './equipment/equipment.module';
import { MeetingsModule } from './meetings/meetings.module';
import { PartiesInteresseesModule } from './parties-interessees/parties-interessees.module';
import { ServicesModule } from './services/services.module';

// --- 7. CONTRÔLEURS & SERVICES GLOBAUX ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UploadController } from './common/upload.controller';
import { SettingsController } from './settings/settings.controller';
import { ContactService } from './auth/contact.service';

// --- 🛡️ GARDES DE SÉCURITÉ (GUARDS) ---
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';

@Module({
  imports: [
    // 🌍 CONFIGURATION ET TÂCHES DE FOND
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ScheduleModule.forRoot(), 
    
    // 🧱 COUCHE INFRASTRUCTURE (Base de données et Utilitaires)
    PrismaModule,
    CommonModule,
    PkiModule,
    NotificationsModule,
    StatsModule,
    MulterModule.register({
      dest: './uploads', 
    }),

    // 🔑 COUCHE IAM & MULTI-TENANCY (Le rempart)
    AuthModule,
    UsersModule,
    TenantsModule,
    AdminMatrixModule, // Gestion Super-Admin (Impersonation)
    MatrixModule,      // Accès Publics (Login Selectors)

    // 🏢 COUCHE ADMINISTRATIVE
    SitesModule,
    OrgUnitsModule,
    OrgUnitTypesModule,
    GouvernanceModule,
    SubscriptionsModule,
    TransactionsModule,
    GenericCrudModule,

    // 🛠️ COUCHE MÉTIER : QUALITÉ (Le Cycle PDCA)
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

    // 🌿 COUCHE MÉTIER : HSE & LÉGAL (Conformité Environnementale & SST)
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

    // 👥 COUCHE RESSOURCES (L'humain et le matériel)
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

    /**
     * 🛡️ BOUCLIER DE SÉCURITÉ GLOBAL
     * L'ordre des gardes est CRITIQUE. NestJS les exécute dans l'ordre de déclaration.
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Étape 1 : Vérification d'Identité ("Qui es-tu ?")
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard, // Étape 2 : Vérification de Licence ("As-tu payé ton droit d'entrée ?")
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Étape 3 : Vérification de Permissions ("As-tu le droit de toucher à ça ?")
    },
  ],
})
export class AppModule {}