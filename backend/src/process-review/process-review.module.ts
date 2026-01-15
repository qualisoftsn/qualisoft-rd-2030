import { Module } from '@nestjs/common';
import { ProcessReviewService } from './process-review.service';
import { ProcessReviewController } from './process-review.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProcessReviewController],
  providers: [ProcessReviewService],
  exports: [ProcessReviewService],
})
export class ProcessReviewModule {}