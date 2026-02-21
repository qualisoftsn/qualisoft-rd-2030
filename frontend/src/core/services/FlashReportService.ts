/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * 📄 SERVICE : FLASH REPORT GENERATOR
 * -------------------------------------------------------------------------
 * FONCTION : Exportation haute-fidélité des KPIs en format PDF.
 * RÔLE : Fournir des preuves documentaires pour les audits de certification.
 * ESTHÉTIQUE : Noir Matrix / Bleu Elite / Typographie Italique Grasse.
 */

export const generateFlashReport = (data: any) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString('fr-FR');

  // 🟦 HEADER ÉLITE (Fond Noir Matrix)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('QUALISOFT : RAPPORT FLASH', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`NOYAU MATRIX RD 2026 • GÉNÉRÉ LE : ${timestamp}`, 20, 35);

  // 📊 CORPS DU RAPPORT
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORGANISATION : ${data.enterpriseName.toUpperCase()}`, 20, 60);

  // 📝 TABLEAU DE DONNÉES SCELLÉES
  autoTable(doc, {
    startY: 70,
    head: [['INDICATEUR STRATÉGIQUE', 'VALEUR MESURÉE']],
    body: [
      ['RÉFÉRENTIEL ORGANISATIONNEL', data.enterpriseName],
      ['ACTIONS EN RETARD (PAQ)', `${data.lateActions} unité(s)`],
      ['NON-CONFORMITÉS OUVERTES', `${data.openNC} dossier(s)`],
      ['TAUX D\'EXÉCUTION PAQ', `${data.paqRate}%`],
      ['SCORE DE CONFORMITÉ GLOBAL', `${data.complianceScore || 0}%`],
    ],
    theme: 'striped',
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: [255, 255, 255], 
      fontSize: 10, 
      fontStyle: 'bold' 
    },
    styles: { 
      fontSize: 10, 
      cellPadding: 6,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { fontStyle: 'bold', halign: 'right' }
    }
  });

  // 🔒 FOOTER DE CERTIFICATION
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Ce document constitue une preuve numérique scellée. Toute altération rompt la chaîne de conformité.`,
    20,
    finalY + 20
  );

  // EXPORTATION SOUVERAINE
  doc.save(`Qualisoft_Flash_${data.enterpriseName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};