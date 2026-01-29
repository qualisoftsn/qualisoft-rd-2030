// File: backend/src/archives/archives.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArchivesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère l'intégralité du patrimoine archivé du Tenant
   */
  async getGlobalArchives(tenantId: string) {
    const [docs, procs, equis, forms, ncs] = await Promise.all([
      this.prisma.document.findMany({ where: { tenantId, DOC_IsActive: false }, orderBy: { DOC_UpdatedAt: 'desc' } }),
      this.prisma.processus.findMany({ where: { tenantId, PR_IsActive: false }, orderBy: { PR_UpdatedAt: 'desc' } }),
      this.prisma.equipment.findMany({ where: { tenantId, EQ_IsActive: false }, orderBy: { EQ_UpdatedAt: 'desc' } }),
      this.prisma.formation.findMany({ where: { tenantId, FOR_IsActive: false }, orderBy: { FOR_UpdatedAt: 'desc' } }),
      this.prisma.nonConformite.findMany({ where: { tenantId, NC_IsActive: false }, orderBy: { NC_UpdatedAt: 'desc' } }),
    ]);

    // Unification du format pour le frontend
    return [
      ...docs.map(d => ({ id: d.DOC_Id, title: d.DOC_Title, type: 'DOCUMENT', date: d.DOC_UpdatedAt, ref: d.DOC_Reference })),
      ...procs.map(p => ({ id: p.PR_Id, title: p.PR_Libelle, type: 'PROCESSUS', date: p.PR_UpdatedAt, ref: p.PR_Code })),
      ...equis.map(e => ({ id: e.EQ_Id, title: e.EQ_Name, type: 'EQUIPEMENT', date: e.EQ_UpdatedAt, ref: e.EQ_Reference })),
      ...forms.map(f => ({ id: f.FOR_Id, title: f.FOR_Title, type: 'FORMATION', date: f.FOR_UpdatedAt, ref: 'GPEC' })),
      ...ncs.map(n => ({ id: n.NC_Id, title: n.NC_Libelle, type: 'NC', date: n.NC_UpdatedAt, ref: 'ISO-10.2' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Restauration d'une entité (Retour en production)
   */
  async restore(tenantId: string, entityId: string, type: string) {
    const mapping: Record<string, any> = {
      'DOCUMENT': { table: 'document', field: 'DOC_IsActive', idField: 'DOC_Id' },
      'PROCESSUS': { table: 'processus', field: 'PR_IsActive', idField: 'PR_Id' },
      'EQUIPEMENT': { table: 'equipment', field: 'EQ_IsActive', idField: 'EQ_Id' },
      'FORMATION': { table: 'formation', field: 'FOR_IsActive', idField: 'FOR_Id' },
      'NC': { table: 'nonConformite', field: 'NC_IsActive', idField: 'NC_Id' },
    };

    const target = mapping[type];
    if (!target) throw new NotFoundException("Type d'entité non géré");

    return (this.prisma[target.table] as any).update({
      where: { [target.idField]: entityId },
      data: { [target.field]: true }
    });
  }
}