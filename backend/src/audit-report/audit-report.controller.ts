import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuditReportService } from './audit-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('audit-report')
@UseGuards(JwtAuthGuard)
export class AuditReportController {
  constructor(private readonly service: AuditReportService) {}

  @Post('generate')
  async generate(
    @Body() body: { auditId: string; template: string }, 
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const pdfBuffer = await this.service.generateReport(
        body.auditId,
        body.template,
        req.user.tenantId
      );
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=audit_${body.template}_${body.auditId}_${Date.now()}.pdf`,
      });
      
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erreur lors de la génération du rapport', 
        details: error.message 
      });
    }
  }
}