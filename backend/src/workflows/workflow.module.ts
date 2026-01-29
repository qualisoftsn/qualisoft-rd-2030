import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowReminderService } from './workflow-reminder.service';
import { WorkflowTasks } from './workflow.task';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowReminderService, WorkflowTasks],
  exports: [WorkflowService],
})
export class WorkflowModule {}