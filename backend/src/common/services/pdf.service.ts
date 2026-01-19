import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  private async generatePdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      this.logger.error(`❌ Erreur Puppeteer : ${error.message}`);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  async generateCustomPdf(htmlContent: string): Promise<Buffer> {
    return this.generatePdf(htmlContent);
  }

  async generateAuditReport(audit: any): Promise<Buffer> {
    const html = `<html><body style="font-family:sans-serif"><h1>RAPPORT D'AUDIT</h1><p>Ref: ${audit.AU_Reference}</p><p>Titre: ${audit.AU_Title}</p></body></html>`;
    return this.generatePdf(html);
  }

  async generateNcReport(nc: any): Promise<Buffer> {
    const html = `<html><body style="font-family:sans-serif; color:red"><h1>FICHE NON-CONFORMITÉ</h1><p>Libellé: ${nc.NC_Libelle}</p></body></html>`;
    return this.generatePdf(html);
  }
}