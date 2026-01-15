/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFlashReport = (data: any) => {
  const doc = new jsPDF();
  doc.setFillColor(11, 15, 26);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('QUALISOFT : RAPPORT FLASH', 20, 25);
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 50,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Organisation', data.enterpriseName],
      ['Actions en Retard', data.lateActions],
      ['Non-Conformités', data.openNC],
      ['Taux PAQ', `${data.paqRate}%`]
    ],
  });
  doc.save(`Flash_Report_${data.enterpriseName}.pdf`);
};