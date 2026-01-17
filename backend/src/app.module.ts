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
import { UploadController } from './common/upload.controller';
import { SettingsController } from './settings/settings.controller';
import { ContactService } from './auth/contact.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    
    PrismaModule,
    AuthModule,
    UsersModule,
    OrgUnitsModule,
    
    MulterModule.register({
      dest: './uploads',
    }),

    AdminModule,
    SubscriptionsModule,
    TransactionsModule,
    SitesModule,

    ProcessusModule,
    AuditsModule,
    NonConformiteModule,
    ActionsModule,
    SseModule,
    MeetingsModule,
    DocumentsModule,
    EquipmentModule,
    RisksModule,
    ServicesModule,
    PartiesInteresseesModule,
    AnalysesModule,
    PaqModule,
    TiersModule,
    ReclamationsModule,
    ProcessReviewModule,
    IndicatorsModule,
  ],
  controllers: [
    AppController, 
    SettingsController,
    UploadController
  ], 
  providers: [
    AppService, ContactService,
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}