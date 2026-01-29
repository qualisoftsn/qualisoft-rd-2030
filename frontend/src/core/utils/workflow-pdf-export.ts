/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportWorkflowPDF = (entityName: string, steps: any[]) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header Style Elite
  doc.setFillColor(11, 15, 26); // #0B0F1A
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("QUALISOFT ELITE - RAPPORT DE FLUX", 15, 25);
  
  doc.setFontSize(10);
  doc.text(`ÉMIS LE : ${date}`, 160, 25);

  // Titre du document
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Entité : ${entityName.toUpperCase()}`, 15, 55);

  // Table des étapes
  autoTable(doc, {
    startY: 65,
    head: [['ORDRE', 'ÉTAPE / COMMENTAIRE', 'APPROBATEUR', 'STATUT', 'DATE VALIDATION']],
    body: steps.map(s => [
      s.AW_Step,
      s.AW_Comment,
      `${s.AW_Approver?.U_FirstName} ${s.AW_Approver?.U_LastName}`,
      s.AW_Status,
      s.AW_ApprovedAt ? new Date(s.AW_ApprovedAt).toLocaleDateString() : 'EN ATTENTE'
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9, cellPadding: 5 }
  });

  // Footer / Signature
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Document généré par le Noyau Master Qualisoft. Intégrité des données certifiée.", 15, finalY);

  doc.save(`WORKFLOW_${entityName.replace(/\s+/g, '_')}_${date}.pdf`);
};