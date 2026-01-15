import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateDashboardPdf(stats: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: "shell" });
    const page = await browser.newPage();

    // Design du rapport en HTML/CSS
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .title { fontSize: 28px; font-weight: bold; text-transform: uppercase; }
            .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .kpi-card { background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; }
            .kpi-label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; }
            .kpi-value { font-size: 24px; font-weight: 900; color: #2563eb; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Rapport Mensuel <span style="color: #2563eb">Qualisoft QSE</span></div>
            <p>Généré le ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Incidents SSE</div>
              <div class="kpi-value">${stats.kpis.totalSSE}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Taux de Levée des Actions</div>
              <div class="kpi-value">${stats.kpis.tauxAvancement}%</div>
            </div>
          </div>

          <h3>Synthèse des risques</h3>
          <p>Le système a enregistré <b>${stats.kpis.totalActions}</b> actions au plan d'action ce mois-ci.</p>
          
          <div class="footer">Document confidentiel - Sénégal Industries QSE - Qualisoft RD 2030</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}