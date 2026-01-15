import PDFDocument from 'pdfkit'; // ✅ Correct pour TypeScript
import * as path from 'path';

/**
 * Génère une Facture Pro-forma officielle pour Qualisoft RD 2030
 * @param tenant Les données de l'organisation cliente
 * @param plan Le plan tarifaire sélectionné
 */
export async function generateProformaPDF(tenant: any, plan: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Initialisation du document A4
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true 
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // --- 1. EN-TÊTE CORPORATE ---
    const logoPath = path.join(process.cwd(), 'public', 'logo-qualisoft.png');
    try {
      doc.image(logoPath, 50, 45, { width: 110 });
    } catch (e) {
      doc.fontSize(22).fillColor('#0284c7').font('Helvetica-Bold').text('QUALISOFT', 50, 45);
    }

    // Coordonnées de l'émetteur (Abdoulaye THIONGANE / Qualisoft)
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold')
       .text('QUALISOFT RD 2030', 200, 50, { align: 'right' });
    
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text('Villa 247, Cité Cheikh Hann', { align: 'right' })
       .text('Route du Lac Rose, DAKAR (Sénégal)', { align: 'right' })
       .text('Tél: +221 77 441 09 02', { align: 'right' })
       .text('Email: qualisoft@qualisoft.sn', { align: 'right' });

    doc.moveDown(4);

    // --- 2. TITRE ET RÉFÉRENCES ---
    doc.rect(50, 140, 500, 2).fill('#0284c7'); // Ligne de séparation bleue
    
    doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold')
       .text('FACTURE PRO-FORMA', 50, 160);
    
    const refDate = new Date();
    doc.fontSize(9).fillColor('#64748b').font('Helvetica')
       .text(`RÉFÉRENCE : QS-PF-${refDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, 50, 185)
       .text(`DATE D'ÉMISSION : ${refDate.toLocaleDateString('fr-FR')}`, 50, 198)
       .text('VALIDITÉ DE L\'OFFRE : 30 JOURS', 50, 211);

    doc.moveDown(3);

    // --- 3. INFORMATIONS CLIENT ---
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('DESTINATAIRE (CLIENT) :', 50, 250);
    doc.fontSize(12).text(tenant.T_Name?.toUpperCase() || 'ORGANISATION CLIENTE', 50, 265);
    doc.fontSize(10).font('Helvetica').fillColor('#475569')
       .text(`À l'attention de M./Mme ${tenant.T_CeoName || 'Directeur Général'}`)
       .text(`Email : ${tenant.T_Email || 'contact@client.sn'}`);

    doc.moveDown(4);

    // --- 4. TABLEAU DE FACTURATION ---
    const tableTop = 350;
    doc.rect(50, tableTop, 500, 20).fill('#f1f5f9');
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold')
       .text('DESCRIPTION DES SERVICES', 60, tableTop + 6)
       .text('DURÉE', 350, tableTop + 6)
       .text('TOTAL HT (FCFA)', 450, tableTop + 6);

    // Calculs financiers (Engagement 24 mois)
    const rawPrice = plan.rawPrice || 0;
    const amountHT = rawPrice * 24;
    const tva = amountHT * 0.18;
    const ttc = amountHT + tva;

    // Ligne de service
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica')
       .text(`Abonnement Annuel SaaS Qualisoft RD 2030 - Plan ${plan.name}`, 60, tableTop + 35, { width: 280 })
       .text('24 Mois', 350, tableTop + 35)
       .text(amountHT.toLocaleString('fr-FR'), 450, tableTop + 35, { align: 'right', width: 80 });

    doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).strokeColor('#e2e8f0').stroke();

    // --- 5. RÉCAPITULATIF FINANCIER ---
    const summaryTop = 450;
    doc.fontSize(10).font('Helvetica').fillColor('#475569')
       .text('TOTAL HORS TAXES (HT)', 330, summaryTop)
       .text(`${amountHT.toLocaleString('fr-FR')} FCFA`, 450, summaryTop, { align: 'right', width: 100 });

    doc.text('TVA SÉNÉGAL (18%)', 330, summaryTop + 20)
       .text(`${tva.toLocaleString('fr-FR')} FCFA`, 450, summaryTop + 20, { align: 'right', width: 100 });

    doc.rect(320, summaryTop + 40, 230, 30).fill('#0284c7');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
       .text('TOTAL TTC À PAYER', 330, summaryTop + 50)
       .text(`${ttc.toLocaleString('fr-FR')} FCFA`, 450, summaryTop + 50, { align: 'right', width: 90 });

    // --- 6. PIED DE PAGE & MENTIONS LÉGALES ---
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Oblique')
       .text('CONDITIONS DE RÈGLEMENT :', 50, 680)
       .text('Paiement intégral à l\'activation par Wave (+221 77 441 09 02), Orange Money ou Virement Bancaire.', 50, 692);

    doc.rect(50, 720, 500, 1).fill('#e2e8f0');
    doc.fillColor('#64748b').fontSize(7).font('Helvetica')
       .text('Qualisoft RD 2030 - Système de Management de la Qualité Intelligent', 50, 740, { align: 'center' })
       .text('Villa 247, Cité Cheikh Hann, Dakar - NINEA en cours', { align: 'center' });

    doc.end();
  });
}