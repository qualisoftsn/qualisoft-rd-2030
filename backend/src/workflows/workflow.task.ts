import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WorkflowReminderService } from './workflow-reminder.service';

@Injectable()
export class WorkflowTasks {
  constructor(private readonly reminderService: WorkflowReminderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCron() {
    await this.reminderService.checkAndNotifyLateSteps();
  }
}