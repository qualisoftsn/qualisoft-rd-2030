import { Injectable, Logger } from '@nestjs/common';
import { PdfService } from '../common/services/pdf.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService
  ) {}

  /**
   * 🏆 GÉNÉRATION RAPPORT ÉLITE : REVUE DE DIRECTION CONSOLIDÉE QHSE-E
   * Intègre : KPI, NC, Actions, Accidents SSE, Consommations Environnementales et Signatures PKI.
   */
  async generateManagementReviewPDF(tenantId: string, month: number, year: number): Promise<Buffer> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // 1. CONSOLIDATION MULTI-DOMAINES (QUALITÉ, SSE, ENVIRONNEMENT, PKI)
    const [
      tenant, 
      indicators, 
      ncStats, 
      actionStats, 
      accidents, 
      consos, 
      wastes, 
      signatures
    ] = await Promise.all([
      // Infos de base
      this.prisma.tenant.findUnique({ where: { T_Id: tenantId } }),
      
      // KPI & Tendances Annuelles
      this.prisma.indicator.findMany({
        where: { tenantId },
        include: { IND_Values: { where: { IV_Year: year }, orderBy: { IV_Month: 'asc' } } }
      }),

      // Qualité : Non-Conformités
      this.prisma.nonConformite.count({
        where: { tenantId, NC_CreatedAt: { gte: startOfMonth, lte: endOfMonth } }
      }),

      // Amélioration : PAQ
      this.prisma.action.groupBy({
        by: ['ACT_Status'],
        where: { tenantId, ACT_CreatedAt: { gte: startOfMonth, lte: endOfMonth } },
        _count: true
      }),

      // 🛡️ SSE : Statistiques Accidents
      this.prisma.accident.findMany({
        where: { tenantId, ACC_Date: { gte: startOfMonth, lte: endOfMonth } }
      }),

      // ♻️ ENVIRONNEMENT : Consommations & Déchets (Nouveau)
      this.prisma.consumption.findMany({ 
        where: { tenantId, CON_Month: month, CON_Year: year } 
      }),
      this.prisma.waste.findMany({ 
        where: { tenantId, WAS_Month: month, WAS_Year: year } 
      }),

      // Sécurité : Validation PKI
      this.prisma.signature.findFirst({
        where: { SIG_EntityId: `PERF-ALL-${month}-${year}`, tenantId },
        orderBy: { SIG_CreatedAt: 'desc' }
      })
    ]);

    // Calculs rapides pour le Dashboard
    const nbAccidents = accidents.length;
    const nbJoursPerdus = accidents.reduce((sum, acc) => sum + (acc.ACC_DaysLost || 0), 0);
    const totalWaste = wastes.reduce((acc, w) => acc + (w.WAS_Weight || 0), 0);

    // 2. LOGIQUE DE CONSTRUCTION DU TEMPLATE HTML ÉLITE
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #1e293b; line-height: 1.4; }
            .header { background: #1e293b; color: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .kpi-card { background: #f8fafc; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
            .kpi-card.sse { border-top: 4px solid #16a34a; }
            .kpi-card.env { border-top: 4px solid #10b981; }
            .kpi-value { font-size: 22px; font-weight: bold; color: #2563eb; }
            .section-title { border-left: 5px solid #2563eb; background: #f1f5f9; padding: 10px; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px; }
            th { background: #f8fafc; color: #475569; }
            .trend-container { display: flex; align-items: flex-end; height: 30px; gap: 2px; width: 100px; }
            .trend-bar { background: #94a3b8; width: 6px; border-radius: 1px; }
            .trend-bar.current { background: #2563eb; }
            .pki-box { margin-top: 20px; padding: 10px; border: 1px dashed #2563eb; background: #eff6ff; font-size: 9px; border-radius: 5px; }
            .env-summary { background: #ecfdf5; padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size: 20px;">REVUE DE DIRECTION SMI (QHSE-E)</h1>
              <p style="margin:5px 0 0 0; opacity: 0.8;">${tenant?.T_Name || 'ORGANISME'} | Période : ${month}/${year}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0">${month.toString().padStart(2, '0')}/${year}</h2>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div style="font-size: 9px; color: #64748b;">NC QUALITÉ</div>
              <div class="kpi-value">${ncStats}</div>
            </div>
            <div class="kpi-card">
              <div style="font-size: 9px; color: #64748b;">ACTIONS CLÔTURÉES</div>
              <div class="kpi-value">${actionStats.find(a => a.ACT_Status === 'TERMINEE')?._count || 0}</div>
            </div>
            <div class="kpi-card sse">
              <div style="font-size: 9px; color: #16a34a; font-weight:bold;">ACCIDENTS SSE</div>
              <div class="kpi-value" style="color:#16a34a">${nbAccidents}</div>
            </div>
            <div class="kpi-card env">
              <div style="font-size: 9px; color: #10b981; font-weight:bold;">DÉCHETS (KG)</div>
              <div class="kpi-value" style="color:#10b981">${totalWaste}</div>
            </div>
          </div>

          <div class="section-title">1. Performance & Tendances des Indicateurs</div>
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Indicateur</th><th style="text-align:center">Cible</th>
                <th style="text-align:center">Réalisé</th><th style="text-align:center">Tendance (12m)</th><th style="text-align:center">État</th>
              </tr>
            </thead>
            <tbody>
              ${indicators.map(ind => {
                const currentVal = ind.IND_Values.find(v => v.IV_Month === month)?.IV_Actual;
                const isSuccess = currentVal !== undefined ? currentVal >= ind.IND_Cible : false;
                const sparkline = Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1;
                  const val = ind.IND_Values.find(v => v.IV_Month === m)?.IV_Actual || 0;
                  const height = Math.min((val / (ind.IND_Cible || 1)) * 100, 100);
                  return `<div class="trend-bar ${m === month ? 'current' : ''}" style="height: ${height}%"></div>`;
                }).join('');
                return `
                  <tr>
                    <td style="font-weight:bold">${ind.IND_Code}</td>
                    <td>${ind.IND_Libelle}</td>
                    <td style="text-align:center">${ind.IND_Cible}</td>
                    <td style="text-align:center; font-weight:bold">${currentVal ?? '---'}</td>
                    <td style="text-align:center"><div class="trend-container">${sparkline}</div></td>
                    <td style="text-align:center">${isSuccess ? '🟢' : '🔴'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="section-title">2. Analyse Environnementale (ISO 14001)</div>
          <div class="env-summary">
            <strong>Consommations Énergétiques :</strong><br/>
            ${consos.length > 0 ? consos.map(c => `${c.CON_Type}: ${c.CON_Value} ${c.CON_Unit}`).join(' | ') : 'Aucun relevé ce mois.'}
          </div>

          ${signatures ? `
            <div class="pki-box">
              <strong>🔒 DOCUMENT CERTIFIÉ NUMÉRIQUEMENT</strong><br>
              Hash de validation : ${signatures.SIG_Hash} | Signé le : ${signatures.SIG_CreatedAt.toLocaleDateString()} par RQ_ID: ${signatures.SIG_UserId}
            </div>
          ` : `<div class="pki-box" style="color:#dc2626; border-color:#dc2626;">⚠️ Rapport en attente de validation officielle (Signature PKI manquante).</div>`}

          <p style="margin-top:20px; font-size:8px; text-align:center; color:#94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Qualisoft RD 2030 - Intelligence QHSE Intégrée
          </p>
        </body>
      </html>
    `;

    return this.pdfService.generateCustomPdf(htmlContent);
  }
}