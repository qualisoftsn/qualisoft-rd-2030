import PDFDocument from 'pdfkit'; // ✅ Correct pour TypeScript
import * as path from 'path';

/**
 * Génère une facture finale acquittée (Closing)
 * @param tenant Données de l'organisation
 * @param transaction Données de la transaction validée
 */
export async function generateInvoicePDF(tenant: any, transaction: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    // Initialisation du document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // --- 1. EN-TÊTE CORPORATE ---
    const logoPath = path.join(process.cwd(), 'public', 'logo-qualisoft.png');
    try {
      doc.image(logoPath, 50, 45, { width: 100 });
    } catch (e) {
      doc.fontSize(22).fillColor('#1d4ed8').font('Helvetica-Bold').text('QUALISOFT', 50, 45);
    }

    doc.fillColor('#444444').fontSize(9).font('Helvetica')
       .text('QUALISOFT RD 2030', 200, 50, { align: 'right' })
       .text('Villa 247, Cité Cheikh Hann', { align: 'right' })
       .text('Route du Lac Rose, DAKAR (Sénégal)', { align: 'right' })
       .text('Contact: qualisoft@qualisoft.sn', { align: 'right' })
       .text('Sénégal - UEMOA', { align: 'right' });

    doc.moveDown(3);

    // --- 2. TITRE & STATUT DE PAIEMENT ---
    // Bandeau vert pour confirmer l'encaissement
    doc.rect(50, 140, 500, 35).fill('#10b981'); 
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('FACTURE FINALE ACQUITTÉE', 65, 152);

    // --- 3. DÉTAILS DE LA FACTURE & CLIENT ---
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('RÉFÉRENCES :', 50, 195);
    doc.font('Helvetica')
       .text(`Facture N° : FAC-${transaction.TX_Id.slice(0, 8).toUpperCase()}`)
       .text(`Date de paiement : ${new Date(transaction.TX_CreatedAt).toLocaleDateString('fr-FR')}`)
       .text(`Méthode : ${transaction.TX_PaymentMethod} (${transaction.TX_Reference})`);

    doc.fontSize(10).font('Helvetica-Bold').text('CLIENT :', 350, 195);
    doc.font('Helvetica')
       .text(tenant.T_Name.toUpperCase(), 350, 210)
       .text(`À l'attention de M./Mme ${tenant.T_CeoName || 'le Directeur Général'}`)
       .text(tenant.T_Email);

    doc.moveDown(4);

    // --- 4. CALCULS FINANCIERS (TVA 18%) ---
    const totalTTC = transaction.TX_Amount;
    const totalHT = totalTTC / 1.18;
    const totalTVA = totalTTC - totalHT;

    // --- 5. TABLEAU DES PRESTATIONS ---
    const tableTop = 300;
    doc.rect(50, tableTop, 500, 20).fill('#f8fafc');
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold')
       .text('DÉSIGNATION DES SERVICES', 60, tableTop + 6)
       .text('QUANTITÉ', 300, tableTop + 6)
       .text('MONTANT HT', 450, tableTop + 6, { align: 'right', width: 90 });

    doc.fillColor('#000000').font('Helvetica').fontSize(10)
       .text(`Abonnement Intégral Qualisoft - Plan ${tenant.T_Plan}`, 60, tableTop + 35, { width: 230 })
       .text('24 Mois', 300, tableTop + 35)
       .text(`${Math.round(totalHT).toLocaleString()} XOF`, 450, tableTop + 35, { align: 'right', width: 90 });

    doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).strokeColor('#e2e8f0').stroke();

    // --- 6. RÉCAPITULATIF FINAL ---
    const summaryTop = 420;
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
       .text('TOTAL HORS TAXES (HT)', 320, summaryTop)
       .text(`${Math.round(totalHT).toLocaleString()} XOF`, 450, summaryTop, { align: 'right', width: 90 });

    doc.text('TVA SÉNÉGAL (18%)', 320, summaryTop + 20)
       .text(`${Math.round(totalTVA).toLocaleString()} XOF`, 450, summaryTop + 20, { align: 'right', width: 90 });

    doc.rect(310, summaryTop + 40, 240, 30).fill('#f1f5f9');
    doc.fillColor('#1d4ed8').font('Helvetica-Bold').fontSize(12)
       .text('NET PAYÉ (TTC)', 320, summaryTop + 50)
       .text(`${totalTTC.toLocaleString()} XOF`, 450, summaryTop + 50, { align: 'right', width: 90 });

    // --- 7. CACHET VISUEL "PAYÉ" ---
    doc.rotate(-15, { origin: [100, 550] });
    doc.rect(80, 530, 120, 40).lineWidth(3).strokeColor('#10b981').stroke();
    doc.fillColor('#10b981').fontSize(18).font('Helvetica-Bold').text('PAYÉ', 110, 542);
    doc.rotate(15, { origin: [100, 550] }); // Remise à zéro de la rotation

    // --- 8. PIED DE PAGE ---
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Oblique')
       .text('Cette facture certifie le règlement intégral de la prestation mentionnée ci-dessus.', 50, 750, { align: 'center' })
       .text('Qualisoft RD 2030 - SIÈGE DAKAR - VILLA 247 CITÉ CHEIKH HANN', { align: 'center' });

    doc.end();
  });
}