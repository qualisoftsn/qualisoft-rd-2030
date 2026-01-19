import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../common/services/pdf.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService
  ) {}

  async generateManagementReviewPDF(tenantId: string, month: number, year: number): Promise<Buffer> {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    const indicators = await this.prisma.indicator.findMany({
      where: { tenantId },
      include: { 
        IND_Processus: true,
        IND_Values: { where: { IV_Month: month, IV_Year: year } }
      }
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; }
            .header { background: #0f172a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .section-title { border-left: 5px solid #2563eb; background: #f8fafc; padding: 10px; font-weight: bold; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0">QUALISOFT RD 2030 - REVUE DE DIRECTION</h2>
            <p style="margin:5px 0 0 0">${tenant?.T_Name || 'CLIENT'} | Période : ${month}/${year}</p>
          </div>
          <div class="section-title">PERFORMANCE DES INDICATEURS</div>
          <table>
            <thead>
              <tr><th>Code</th><th>Indicateur</th><th>Cible</th><th>Réalisé</th></tr>
            </thead>
            <tbody>
              ${indicators.map(ind => `
                <tr>
                  <td>${ind.IND_Code}</td>
                  <td>${ind.IND_Libelle}</td>
                  <td>${ind.IND_Cible}</td>
                  <td>${ind.IND_Values[0]?.IV_Actual ?? 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top:40px; font-size:10px; text-align:center; color:#94a3b8">Document confidentiel - Qualisoft Elite 2030</p>
        </body>
      </html>
    `;

    return this.pdfService.generateCustomPdf(htmlContent);
  }
}