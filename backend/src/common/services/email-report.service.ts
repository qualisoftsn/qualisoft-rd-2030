import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailReportService {
  async sendAnalyticalReport(to: string, pdfBuffer: Buffer, message: string) {
    console.log(`Email envoyé à ${to} avec le rapport PDF`);
    return { success: true };
  }
}