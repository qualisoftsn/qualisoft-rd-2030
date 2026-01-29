import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('initiate')
  async initiate(@Req() req: any, @Body() body: any) {
    // Appel de la méthode corrigée dans le service
    return this.workflowService.initiate(req.user.tenantId, req.user.U_Id, body);
  }

  @Post('process/:id')
  async process(
    @Req() req: any, 
    @Param('id') id: string, 
    @Body() body: { status: 'APPROUVE' | 'REJETE', comment: string }
  ) {
    return this.workflowService.process(req.user.tenantId, id, req.user.U_Id, body.status, body.comment);
  }

  @Get('tasks')
  async getTasks(@Req() req: any) {
    return this.workflowService.getTasks(req.user.tenantId, req.user.U_Id);
  }
}