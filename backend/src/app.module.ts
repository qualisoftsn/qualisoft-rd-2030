import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// --- INFRASTRUCTURE, SÉCURITÉ & CŒUR ---
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PkiModule } from './pki/pki.module';
import { StatsModule } from './modules/stats/stats.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';

// --- ADMINISTRATION & FINANCE ---
import { AdminModule } from './admin/admin.module';
import { SitesModule } from './sites/sites.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GouvernanceModule } from './gouvernance/gouvernance.module';

// --- MODULES MÉTIER SMI (ISO 9001 - Cycle de Qualité) ---
import { ProcessusModule } from './processus/processus.module';
import { AuditsModule } from './audits/audits.module';
import { NonConformiteModule } from './non-conformites/non-conformites.module';
import { ActionsModule } from './actions/actions.module';
import { PaqModule } from './paq/paq.module';
import { TiersModule } from './tiers/tiers.module';
import { ReclamationsModule } from './reclamations/reclamations.module';
import { ProcessReviewModule } from './process-review/process-review.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DocumentsModule } from './documents/documents.module';
import { QualityObjectivesModule } from './quality-objectives/quality-objectives.module';
import { SmiModule } from './smi/smi.module';
import { CopilModule } from './copil/copil.module';

// --- SMI SPÉCIALISÉ & GOUVERNANCE (ISO 14001, 45001, RH & GPEC) ---
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
import { TrainingModule } from './training/training.module';
import { WorkflowModule } from './workflows/workflow.module';

// --- CONTROLLERS & SERVICES DE BASE ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactService } from './auth/contact.service';
import { UploadController } from './common/upload.controller';
import { HealthController } from './health/health.controller';
import { SettingsController } from './settings/settings.controller';
import { FormationsModule } from './formations/formations.module';



@Module({
  imports: [
    // 1️⃣ CONFIGURATION & NOYAU (Infrastructure)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    PkiModule,
    NotificationsModule,
    StatsModule,

    // 2️⃣ IDENTITÉ, TENANTS & ACCÈS (IAM)
    AuthModule,
    UsersModule,
    TenantsModule,

    // 3️⃣ ADMINISTRATION & FINANCE
    MulterModule.register({
      dest: './uploads',
    }),
    AdminModule,
    SubscriptionsModule,
    TransactionsModule,
    SitesModule,
    OrgUnitsModule,
    GouvernanceModule,

    // 4️⃣ SMI CORE (Standard ISO 9001)
    ProcessusModule,
    AuditsModule,
    NonConformiteModule,
    ActionsModule,
    PaqModule,
    TiersModule,
    ReclamationsModule,
    ProcessReviewModule,
    IndicatorsModule,
    DocumentsModule,
    QualityObjectivesModule,
    SmiModule,
    CopilModule,
    FormationsModule,

    // 5️⃣ SMI SPÉCIALISÉ (SST, Environnement, RH & Ops)
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
    TrainingModule,
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

    // 🛡️ SYSTÈME DE PROTECTION GLOBAL 
    // L'ordre est vital pour la séquence de décodage et de validation
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Authentification (Qui es-tu ?)
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard, // 2. Licence (As-tu payé ?)
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 3. Autorisation (As-tu le droit ?)
    },
  ],
})
export class AppModule {}