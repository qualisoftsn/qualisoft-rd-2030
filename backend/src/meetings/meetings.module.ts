import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsExportService } from './meetings-export.service'; // ✅ Ajout
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MeetingsService, MeetingsExportService], // ✅ Ajout
  controllers: [MeetingsController],
  exports: [MeetingsService]
})
export class MeetingsModule {}