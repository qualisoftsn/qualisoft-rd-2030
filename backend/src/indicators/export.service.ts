import { Injectable, Logger } from '@nestjs/common';
import { SSEType } from '@prisma/client';
import { PdfService } from '../common/services/pdf.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService
  ) {}

  async generateManagementReviewPDF(tenantId: string, month: number, year: number): Promise<Buffer> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const [tenant, indicators, ncStats, sseEvents, sseStats, signatures] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { T_Id: tenantId } }),
      this.prisma.indicator.findMany({
        where: { tenantId },
        include: { IND_Values: { where: { IV_Year: year }, orderBy: { IV_Month: 'asc' } } }
      }),
      this.prisma.nonConformite.count({
        where: { tenantId, NC_CreatedAt: { gte: startOfMonth, lte: endOfMonth } }
      }),
      this.prisma.sSEEvent.findMany({
        where: { 
          tenantId, 
          SSE_DateEvent: { gte: startOfMonth, lte: endOfMonth },
          SSE_Type: { in: [SSEType.ACCIDENT_TRAVAIL, SSEType.ACCIDENT_TRAVAIL_TRAJET] }
        }
      }),
      this.prisma.sSEStats.findFirst({
        where: { tenantId, ST_Mois: month, ST_Annee: year }
      }),
      this.prisma.signature.findFirst({
        where: { SIG_EntityId: `PERF-ALL-${month}-${year}`, tenantId },
        orderBy: { SIG_CreatedAt: 'desc' }
      })
    ]);

    const nbJoursPerdus = sseEvents.reduce((sum, acc) => sum + (acc.SSE_NbJoursArret || 0), 0);

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #334155; }
            .header { background: #0f172a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .kpi-card { background: #f1f5f9; padding: 10px; border-radius: 5px; text-align: center; border: 1px solid #e2e8f0; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 10px; }
            th { background: #f8fafc; font-weight: bold; }
            .trend-container { display: flex; align-items: flex-end; height: 20px; gap: 2px; }
            .trend-bar { background: #cbd5e1; width: 4px; }
            .trend-bar.current { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0">REVUE DE DIRECTION - ${tenant?.T_Name || 'SMI'}</h1>
            <p>Période : ${month}/${year} | État : ${signatures ? '✅ VALIDÉ' : '⚠️ BROUILLON'}</p>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card"><div>NC QUALITÉ</div><div class="kpi-value">${ncStats}</div></div>
            <div class="kpi-card"><div>TF (FRÉQUENCE)</div><div class="kpi-value">${sseStats?.ST_TauxFrequence?.toFixed(2) || '0.00'}</div></div>
            <div class="kpi-card"><div>TG (GRAVITÉ)</div><div class="kpi-value">${sseStats?.ST_TauxGravite?.toFixed(2) || '0.00'}</div></div>
            <div class="kpi-card"><div>JOURS ARRÊT</div><div class="kpi-value">${nbJoursPerdus}</div></div>
          </div>

          <h3>SUIVI DE LA PERFORMANCE DES PROCESSUS</h3>
          <table>
            <thead>
              <tr>
                <th>CODE</th><th>INDICATEUR</th><th>CIBLE</th><th>RÉEL</th><th>TENDANCE (12M)</th><th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              ${indicators.map(ind => {
                const valObj = ind.IND_Values.find(v => v.IV_Month === month);
                const currentVal = valObj ? valObj.IV_Actual : undefined;
                
                // Correction sécurisée de la ligne 121
                let statusIcon = '⚪'; 
                if (currentVal !== undefined && currentVal !== null) {
                  statusIcon = currentVal >= ind.IND_Cible ? '🟢' : '🔴';
                }

                const trend = Array.from({ length: 12 }, (_, i) => {
                  const mVal = ind.IND_Values.find(v => v.IV_Month === i + 1)?.IV_Actual || 0;
                  const h = Math.min((mVal / (ind.IND_Cible || 1)) * 100, 100);
                  return `<div class="trend-bar ${i+1 === month ? 'current' : ''}" style="height:${h}%"></div>`;
                }).join('');

                return `<tr>
                  <td><b>${ind.IND_Code}</b></td>
                  <td>${ind.IND_Libelle}</td>
                  <td style="text-align:center">${ind.IND_Cible}</td>
                  <td style="text-align:center; font-weight:bold">${currentVal ?? '---'}</td>
                  <td><div class="trend-container">${trend}</div></td>
                  <td style="text-align:center">${statusIcon}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>

          ${signatures ? `
            <div style="margin-top:30px; border: 1px dashed #2563eb; padding: 15px; font-size: 10px; background: #f0f9ff; border-radius: 5px;">
              <strong>🔒 CERTIFICATION NUMÉRIQUE PKI</strong><br>
              Document validé officiellement. Hash : ${signatures.SIG_Hash}<br>
              Signé le : ${signatures.SIG_CreatedAt.toLocaleDateString()}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    return this.pdfService.generateCustomPdf(htmlContent);
  }
}