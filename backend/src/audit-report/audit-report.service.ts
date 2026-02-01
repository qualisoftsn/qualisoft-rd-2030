import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditReportService {
  constructor(private prisma: PrismaService) {}

  async generateReport(auditId: string, template: string, tenantId: string): Promise<Buffer> {
    // Récupérer les données de l'audit
    const audit = await this.prisma.audit.findFirst({
      where: { AU_Id: auditId, tenantId },
      include: {
        AU_Findings: true,
        AU_NonConformites: {
          include: {
            NC_Actions: {
              where: { ACT_IsActive: true },
              include: { ACT_Responsable: true }
            }
          }
        },
        AU_Actions: {
          where: { ACT_IsActive: true },
          include: { ACT_Responsable: true }
        },
        AU_Lead: true,
        AU_Site: true,
        AU_Processus: true,
        AU_Preuves: true
      }
    });

    if (!audit) throw new NotFoundException('Audit non trouvé');

    // Créer le document PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    // Générer le contenu selon le template
    if (template === 'ISO_9001') {
      await this.generateISO9001Report(doc, audit, tenantId);
    } else if (template === 'ISO_14001') {
      await this.generateISO14001Report(doc, audit, tenantId);
    } else if (template === 'LEGAL_SENEGAL') {
      await this.generateLegalReport(doc, audit, tenantId);
    } else {
      throw new Error('Template non supporté');
    }

    doc.end();
    return Buffer.concat(chunks);
  }

  private async generateISO9001Report(doc: any, audit: any, tenantId: string) {
    // En-tête
    this.addHeader(doc, 'RAPPORT D\'AUDIT INTERNE', 'ISO 9001:2015');
    
    // Informations générales
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('1. INFORMATIONS GÉNÉRALES', 50, 150);
    doc.font('Helvetica').fontSize(10);
    
    const infos = [
      `Référence Audit: ${audit.AU_Reference}`,
      `Titre: ${audit.AU_Title}`,
      `Type d'Audit: ${audit.AU_Type}`,
      `Date Audit: ${new Date(audit.AU_DateAudit).toLocaleDateString('fr-FR')}`,
      `Auditeur: ${audit.AU_Lead?.U_FirstName} ${audit.AU_Lead?.U_LastName}`,
      `Site Audité: ${audit.AU_Site?.S_Name}`,
      `Processus: ${audit.AU_Processus?.PR_Libelle || 'Non spécifié'}`,
      `Période couverte: ${audit.AU_Scope}`
    ];
    
    infos.forEach((info, i) => {
      doc.text(info, 50, 170 + (i * 15));
    });
    
    // Portée de l'audit
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('2. PORTÉE DE L\'AUDIT');
    doc.font('Helvetica').fontSize(10);
    doc.text(audit.AU_Scope, { width: 500, align: 'justify' });
    
    // Constatations
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('3. CONSTATATIONS');
    
    audit.AU_Findings.forEach((finding, i) => {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text(`${i + 1}. ${finding.FI_Type.replace('_', ' ')}`, { continued: true });
      doc.font('Helvetica').fontSize(10);
      doc.text(`: ${finding.FI_Description}`);
    });
    
    // Non-conformités
    if (audit.AU_NonConformites.length > 0) {
      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('4. NON-CONFORMITÉS IDENTIFIÉES');
      
      audit.AU_NonConformites.forEach((nc, i) => {
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text(`${i + 1}. ${nc.NC_Libelle} (${nc.NC_Gravite})`);
        doc.font('Helvetica').fontSize(10);
        doc.text(nc.NC_Description, { indent: 15, width: 485, align: 'justify' });
        
        // Actions correctives
        if (nc.NC_Actions.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10);
          doc.text('Actions Correctives:', { indent: 15 });
          doc.font('Helvetica').fontSize(9);
          
          nc.NC_Actions.forEach((action, j) => {
            doc.text(
              `${j + 1}. ${action.ACT_Title} - Resp: ${action.ACT_Responsable?.U_FirstName || 'Non assigné'} - Échéance: ${action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'Non définie'}`,
              { indent: 30 }
            );
          });
        }
      });
    }
    
    // Conclusion et Recommandations
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('5. CONCLUSION ET RECOMMANDATIONS');
    doc.font('Helvetica').fontSize(10);
    doc.text(
      audit.AU_Conclusion || 'Aucune conclusion fournie. L\'audit a permis d\'identifier des opportunités d\'amélioration conformément aux exigences de la norme ISO 9001:2015.',
      { width: 500, align: 'justify' }
    );
    
    // Pied de page
    this.addFooter(doc, tenantId);
  }

  private async generateISO14001Report(doc: any, audit: any, tenantId: string) {
    // Structure similaire mais avec sections environnementales spécifiques
    this.addHeader(doc, 'RAPPORT D\'AUDIT ENVIRONNEMENTAL', 'ISO 14001:2015');
    
    // ... contenu spécifique ISO 14001 avec aspects environnementaux, déchets, consommations
    // Ajout de sections spécifiques:
    // - Aspects environnementaux significatifs identifiés
    // - Conformité aux exigences légales sénégalaises
    // - Performances environnementales (consommations, déchets)
    // - Objectifs environnementaux
    
    this.addFooter(doc, tenantId);
  }

  private async generateLegalReport(doc: any, audit: any, tenantId: string) {
    // Rapport spécifique conformité légale sénégalaise
    this.addHeader(doc, 'RAPPORT DE CONFORMITÉ LÉGALE', 'EXIGENCES SÉNÉGALAISES');
    
    // ... contenu avec références légales sénégalaises, autorités compétentes
    // Ajout de sections:
    // - Registre des exigences légales applicables
    // - État de conformité par catégorie (Travail, Environnement, Fiscalité)
    // - Actions de mise en conformité
    // - Échéances réglementaires à venir
    
    this.addFooter(doc, tenantId);
  }

  private addHeader(doc: any, title: string, subtitle: string) {
    // Logo et en-tête
    doc.fontSize(16).font('Helvetica-Bold').text('QUALISOFT', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Plateforme Sénégalaise de Gestion de la Qualité', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(subtitle, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
  }

  private async addFooter(doc: any, tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { T_Id: tenantId },
      select: { T_Name: true, T_Address: true, T_Phone: true }
    });
    
    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica').fillColor('#555');
    doc.text(`Généré par Qualisoft pour ${tenant?.T_Name || 'Entreprise'}`, 50, doc.page.height - 100);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, doc.page.height - 85);
    doc.text(`Page ${doc.pageNumber} sur ${doc.pages.length}`, { align: 'right' });
    
    // Pied de page avec contact
    doc.moveTo(50, doc.page.height - 70).lineTo(550, doc.page.height - 70).stroke();
    doc.fontSize(8).fillColor('#333');
    doc.text(`Qualisoft Sénégal - ${tenant?.T_Phone || 'Contact'}`, 50, doc.page.height - 60);
    doc.text(`www.qualisoft.sn - contact@qualisoft.sn`, { align: 'right' });
  }
}