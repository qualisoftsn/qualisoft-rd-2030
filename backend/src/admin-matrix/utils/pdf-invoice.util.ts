/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📄 UTILS : PDF Invoice Generator
 * RÔLE : Génération de factures PDF professionnelles
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  tenantName: string;
  tenantAddress?: string;
  tenantEmail?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
}

export async function generateInvoicePDF(data: InvoiceData, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const filePath = path.resolve(outputPath);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // HEADER
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('FACTURE', { align: 'right' });

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`N° ${data.invoiceNumber}`, { align: 'right' });

      doc.moveDown(2);

      // INFO TENANT
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Facturé à :');

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text(data.tenantName)
        .text(data.tenantAddress || '')
        .text(data.tenantEmail || '');

      doc.moveDown(2);

      // DATES
      const tableTop = doc.y;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(`Date d'émission : ${data.invoiceDate}`, 50, tableTop)
        .text(`Date limite : ${data.dueDate}`, 300, tableTop);

      doc.moveDown(3);

      // TABLEAU ITEMS
      let currentItemY = doc.y;
      const itemHeight = 20;

      // En-têtes
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .rect(50, currentItemY, 500, itemHeight)
        .fill('#1e40af');

      doc
        .fillColor('#ffffff')
        .text('Description', 60, currentItemY + 5, { width: 250 })
        .text('Qté', 320, currentItemY + 5, { width: 50, align: 'center' })
        .text('Prix Unit.', 380, currentItemY + 5, { width: 80, align: 'right' })
        .text('Total', 480, currentItemY + 5, { width: 80, align: 'right' });

      currentItemY += itemHeight;

      // Items
      data.items.forEach((item) => {
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#333333')
          .text(item.description, 60, currentItemY + 5, { width: 250 })
          .text(item.quantity.toString(), 320, currentItemY + 5, { width: 50, align: 'center' })
          .text(formatCurrency(item.unitPrice, data.currency), 380, currentItemY + 5, { width: 80, align: 'right' })
          .text(formatCurrency(item.total, data.currency), 480, currentItemY + 5, { width: 80, align: 'right' });

        doc.moveTo(50, currentItemY + itemHeight).lineTo(550, currentItemY + itemHeight).stroke('#e5e5e5');
        currentItemY += itemHeight;
      });

      doc.moveDown(2);

      // TOTAUX
      const totalsX = 350;
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Sous-total:', totalsX, doc.y, { width: 100, align: 'right' })
        .text(formatCurrency(data.subtotal, data.currency), totalsX + 110, doc.y, { width: 100, align: 'right' });

      doc.moveDown(0.5);
      doc
        .text('TVA (18%):', totalsX, doc.y, { width: 100, align: 'right' })
        .text(formatCurrency(data.tax, data.currency), totalsX + 110, doc.y, { width: 100, align: 'right' });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('TOTAL TTC:', totalsX, doc.y, { width: 100, align: 'right' })
        .text(formatCurrency(data.total, data.currency), totalsX + 110, doc.y, { width: 100, align: 'right' });

      doc.moveDown(3);

      // NOTES
      if (data.notes) {
        doc
          .fontSize(9)
          .font('Helvetica-Oblique')
          .fillColor('#999999')
          .text(`Notes : ${data.notes}`, 50, doc.y, { width: 500 });
      }

      // FOOTER
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text('© ' + new Date().getFullYear() + ' Qualisoft Elite. Tous droits réservés.', 50, doc.page.height - 50, { width: 500, align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: currency || 'XOF',
  }).format(amount);
}