import { Controller, Get, Post, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Plan } from '@prisma/client';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Get('my-plan')
  async getMyPlan(@Req() req: any) {
    return this.subService.getSubscriptionDetails(req.user.tenantId);
  }

  @Post('renew')
  async renew(@Req() req: any, @Body() body: { months: number }) {
    const details = await this.subService.getSubscriptionDetails(req.user.tenantId);
    return this.subService.upgradePlan(req.user.tenantId, details.currentPlan, body.months);
  }

  @Patch('upgrade')
  async upgrade(@Req() req: any, @Body() body: { plan: Plan, months: number }) {
    return this.subService.upgradePlan(req.user.tenantId, body.plan, body.months);
  }
}