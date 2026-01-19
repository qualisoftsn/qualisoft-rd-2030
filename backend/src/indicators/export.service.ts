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

    // 1. RÉCUPÉRATION TYPÉE (Plus de "as any" ici)
    const [tenant, indicators, ncStats, sseEvents, sseStats, consos, wastes, signatures] = await Promise.all([
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

      // Nouvelles tables maintenant reconnues par l'IntelliSense
      this.prisma.consumption.findMany({
        where: { tenantId, CON_Month: month, CON_Year: year }
      }),

      this.prisma.waste.findMany({
        where: { tenantId, WAS_Month: month, WAS_Year: year }
      }),

      this.prisma.signature.findFirst({
        where: { SIG_EntityId: `PERF-ALL-${month}-${year}`, tenantId },
        orderBy: { SIG_CreatedAt: 'desc' }
      })
    ]);

    // Calculs de synthèse
    const nbAccidents = sseEvents.length;
    const totalWaste = wastes.reduce((acc, w) => acc + (w.WAS_Weight || 0), 0);
    const totalEnergy = consos.filter(c => c.CON_Type === 'ELECTRICITE').reduce((acc, c) => acc + c.CON_Value, 0);

    // 2. TEMPLATE HTML (Inclusion des données environnementales)
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 25px; color: #1e293b; }
            .header { background: #1e293b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .kpi-card { background: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
            .kpi-value { font-size: 22px; font-weight: bold; color: #2563eb; }
            .section-title { background: #f1f5f9; padding: 8px; font-weight: bold; margin-top: 20px; border-left: 4px solid #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px; }
            .status-icon { font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0">REVUE DE DIRECTION QHSE - ${tenant?.T_Name || 'SMI'}</h1>
            <p>Rapport consolidé mensuel : ${month}/${year}</p>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card"><div>NC QUALITÉ</div><div class="kpi-value">${ncStats}</div></div>
            <div class="kpi-card"><div>ACCIDENTS</div><div class="kpi-value">${nbAccidents}</div></div>
            <div class="kpi-card"><div>ÉLEC (kWh)</div><div class="kpi-value">${totalEnergy}</div></div>
            <div class="kpi-card"><div>DÉCHETS (kg)</div><div class="kpi-value">${totalWaste}</div></div>
          </div>

          <div class="section-title">SUIVI DES INDICATEURS DE PERFORMANCE</div>
          <table>
            <thead>
              <tr>
                <th>CODE</th><th>LIBELLÉ</th><th>CIBLE</th><th>RÉEL</th><th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              ${indicators.map(ind => {
                const valObj = ind.IND_Values.find(v => v.IV_Month === month);
                const currentVal = valObj ? valObj.IV_Actual : null;
                const statusIcon = currentVal !== null ? (currentVal >= ind.IND_Cible ? '🟢' : '🔴') : '⚪';
                
                return `<tr>
                  <td><b>${ind.IND_Code}</b></td>
                  <td>${ind.IND_Libelle}</td>
                  <td>${ind.IND_Cible}</td>
                  <td>${currentVal ?? '---'}</td>
                  <td style="text-align:center">${statusIcon}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>

          <div class="section-title">BILAN ENVIRONNEMENTAL (ISO 14001)</div>
          <p style="font-size: 11px;">
            Nombre de pesées déchets : ${wastes.length} | 
            Total valorisé : ${wastes.filter(w => w.WAS_Treatment === 'RECYCLAGE').length} pesées.
          </p>

          ${signatures ? `
            <div style="margin-top:40px; border: 1px dashed #2563eb; padding: 10px; font-size: 10px; background: #f0f9ff;">
              ✅ <b>CERTIFIÉ PAR SIGNATURE ÉLECTRONIQUE PKI</b><br>
              Hash : ${signatures.SIG_Hash} | Date : ${signatures.SIG_CreatedAt.toLocaleString()}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    return this.pdfService.generateCustomPdf(htmlContent);
  }
}