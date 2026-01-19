import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';

// --- INFRASTRUCTURE & SECURITE ---
import { AuthModule } from './auth/auth.module';
import { SubscriptionGuard } from './auth/guards/subscription.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

// --- ADMINISTRATION & FINANCE ---
import { AdminModule } from './admin/admin.module';
import { SitesModule } from './sites/sites.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';

// --- MODULES METIER (SMI) ---
import { ActionsModule } from './actions/actions.module';
import { AnalysesModule } from './analyses/analyses.module';
import { AuditsModule } from './audits/audits.module';
import { DocumentsModule } from './documents/documents.module';
import { EnvironmentModule } from './environment/environment.module'; // ✅ AJOUT : Module ISO 14001
import { EquipmentModule } from './equipment/equipment.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NonConformiteModule } from './non-conformites/non-conformites.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { PaqModule } from './paq/paq.module';
import { PartiesInteresseesModule } from './parties-interessees/parties-interessees.module';
import { ProcessReviewModule } from './process-review/process-review.module';
import { ProcessusModule } from './processus/processus.module';
import { ReclamationsModule } from './reclamations/reclamations.module';
import { RisksModule } from './risks/risks.module';
import { ServicesModule } from './services/services.module';
import { SseModule } from './sse/sse.module';
import { TiersModule } from './tiers/tiers.module';

// --- CONTROLLERS & SERVICES DE BASE ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactService } from './auth/contact.service';
import { UploadController } from './common/upload.controller';
import { SettingsController } from './settings/settings.controller';

@Module({
  imports: [
    // 1. Config & Core
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    
    // 2. Auth & IAM
    AuthModule,
    UsersModule,
    
    // 3. Infrastructure
    MulterModule.register({
      dest: './uploads',
    }),
    OrgUnitsModule,
    AdminModule,
    SubscriptionsModule,
    TransactionsModule,
    SitesModule,

    // 4. SMI Core (Qualité)
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

    // 5. SMI Spécialisé (SSE & Environnement)
    SseModule,
    EnvironmentModule, // ✅ AJOUT : Activation des services Conso/Déchets
    
    // 6. Gouvernance & Risques
    MeetingsModule,
    EquipmentModule,
    RisksModule,
    ServicesModule,
    PartiesInteresseesModule,
    AnalysesModule,
  ],
  controllers: [
    AppController, 
    SettingsController,
    UploadController
  ], 
  providers: [
    AppService, 
    ContactService,
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}