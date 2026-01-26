import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// --- INFRASTRUCTURE & SÉCURITÉ ---
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

// --- ADMINISTRATION & FINANCE ---
import { AdminModule } from './admin/admin.module';
import { SitesModule } from './sites/sites.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';

// --- MODULES MÉTIER (SMI - Qualisoft Elite RD 2030) ---
import { ActionsModule } from './actions/actions.module';
import { AnalysesModule } from './analyses/analyses.module';
import { AuditsModule } from './audits/audits.module';
import { DocumentsModule } from './documents/documents.module';
import { EnvironmentModule } from './environment/environment.module';
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
import { HealthController } from './health/health.controller';
import { SettingsController } from './settings/settings.controller';

@Module({
  imports: [
    // 1️⃣ CONFIGURATION NOYAU (Chargement prioritaire du .env)
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: join(process.cwd(), '.env'), 
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    
    // 2️⃣ IDENTITÉ & ACCÈS
    AuthModule,
    UsersModule,
    
    // 3️⃣ INFRASTRUCTURE & GED
    MulterModule.register({
      dest: './uploads',
    }),
    AdminModule,
    SubscriptionsModule,
    TransactionsModule,
    SitesModule,
    OrgUnitsModule,

    // 4️⃣ SMI CORE (ISO 9001)
    ProcessusModule, AuditsModule, NonConformiteModule, ActionsModule,
    PaqModule, TiersModule, ReclamationsModule, ProcessReviewModule,
    IndicatorsModule, DocumentsModule,

    // 5️⃣ SMI SPÉCIALISÉ & GOUVERNANCE
    SseModule, EnvironmentModule, MeetingsModule, EquipmentModule,
    RisksModule, ServicesModule, PartiesInteresseesModule, AnalysesModule,
  ],
  controllers: [
    AppController, SettingsController, UploadController, HealthController
  ], 
  providers: [
    AppService, 
    ContactService, 

    // 🛡️ SYSTÈME DE PROTECTION GLOBAL (ORDRE STRICT)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: SubscriptionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}