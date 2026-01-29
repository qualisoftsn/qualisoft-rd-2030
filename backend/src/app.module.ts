import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// --- 1️⃣ INFRASTRUCTURE, SÉCURITÉ & NOYAU ---
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PkiModule } from './pki/pki.module';
import { StatsModule } from './modules/stats/stats.module';

// --- 🛡️ SYSTÈME DE PROTECTION (GUARDS) ---
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';

// --- 2️⃣ ADMINISTRATION, SITES & FINANCE ---
import { AdminModule } from './admin/admin.module';
import { SitesModule } from './sites/sites.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GouvernanceModule } from './gouvernance/gouvernance.module';

// --- 3️⃣ MODULES MÉTIER SMI (ISO 9001 - Cycle de Qualité) ---
import { ProcessusModule } from './processus/processus.module';
import { AuditsModule } from './audits/audits.module';
import { NonConformiteModule } from './non-conformites/non-conformites.module';
import { ActionsModule } from './actions/actions.module';
import { ActionsTabModule } from './actions-tab/actions-tab.module'; // Hub de pilotage
import { PaqModule } from './paq/paq.module';
import { TiersModule } from './tiers/tiers.module';
import { ReclamationsModule } from './reclamations/reclamations.module';
import { ProcessReviewModule } from './process-review/process-review.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DocumentsModule } from './documents/documents.module';
import { QualityObjectivesModule } from './quality-objectives/quality-objectives.module';
import { SmiModule } from './smi/smi.module';
import { CopilModule } from './copil/copil.module';
import { ArchivesModule } from './archives/archives.module'; // Chambre forte

// --- 4️⃣ SMI SPÉCIALISÉ & GPEC (SST, ENV, RH) ---
import { SseModule } from './sse/sse.module';
import { EnvironmentModule } from './environment/environment.module';
import { MeetingsModule } from './meetings/meetings.module';
import { EquipmentModule } from './equipment/equipment.module';
import { CompetencesModule } from './competences/competences.module';
import { RisksModule } from './risks/risks.module';
import { ServicesModule } from './services/services.module';
import { PartiesInteresseesModule } from './parties-interessees/parties-interessees.module';
import { AnalysesModule } from './analyses/analyses.module';
import { ExpositionModule } from './exposition/exposition.module';
import { FormationsModule } from './formations/formations.module'; // Nomenclature unifiée
import { WorkflowModule } from './workflows/workflow.module';

// --- 5️⃣ CONTROLLERS & SERVICES DE BASE ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactService } from './auth/contact.service';
import { UploadController } from './common/upload.controller';
import { HealthController } from './health/health.controller';
import { SettingsController } from './settings/settings.controller';

@Module({
  imports: [
    // 🌍 CONFIGURATION GLOBALE
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ScheduleModule.forRoot(), // Pour les tâches Cron (Relances VGP, Formations)
    
    // 🧱 INFRASTRUCTURE
    PrismaModule,
    CommonModule,
    PkiModule,
    NotificationsModule,
    StatsModule,
    MulterModule.register({
      dest: './uploads',
    }),

    // 🔑 IAM (Identity & Access Management)
    AuthModule,
    UsersModule,
    TenantsModule,

    // 🏢 GESTION ADMINISTRATIVE & FINANCIÈRE
    AdminModule,
    SubscriptionsModule,
    TransactionsModule,
    SitesModule,
    OrgUnitsModule,
    GouvernanceModule,

    // 🛠️ SMI CORE (Cycle PDCA - ISO 9001)
    ProcessusModule,
    AuditsModule,
    NonConformiteModule,
    ActionsModule,
    ActionsTabModule, // Le Hub de pilotage des actions
    PaqModule,
    TiersModule,
    ReclamationsModule,
    ProcessReviewModule,
    IndicatorsModule,
    DocumentsModule,
    QualityObjectivesModule,
    SmiModule,
    CopilModule,
    ArchivesModule, // La chambre forte (Zéro suppression)

    // 🌿 SMI SPÉCIALISÉ & CAPITAL HUMAIN
    SseModule,
    EnvironmentModule,
    MeetingsModule,
    EquipmentModule,
    CompetencesModule,
    RisksModule,
    ServicesModule,
    PartiesInteresseesModule,
    AnalysesModule,
    ExpositionModule,
    FormationsModule, // Gestion des compétences (§7.2)
    WorkflowModule,
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

    // 🛡️ SYSTÈME DE PROTECTION GLOBAL (ORDRE CRITIQUE)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Authentification : "Qui es-tu ?"
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard, // 2. Licence : "Ton instance est-elle active ?"
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 3. Autorisation : "As-tu le droit d'être ici ?"
    },
  ],
})
export class AppModule {}