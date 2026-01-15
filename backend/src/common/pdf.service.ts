import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdf(content: any): Promise<Buffer> {
    this.logger.log('Génération du rapport PDF Qualisoft...');
    // Logique de simulation de buffer PDF (à lier à PDFKit ou Puppeteer plus tard)
    return Buffer.from(`Rapport Qualisoft RD 2030 - Données: ${JSON.stringify(content)}`);
  }
}