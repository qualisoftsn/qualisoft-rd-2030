import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenericCrudService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère le nom de la clé primaire (ex: ACT_Id pour Action)
   */
  private getPrimaryKeyName(model: string): string {
    const modelPrefixes: Record<string, string> = {
      action: 'ACT_Id',
      processus: 'PR_Id',
      risk: 'RS_Id',
      site: 'S_Id',
      user: 'U_Id',
      nonConformite: 'NC_Id',
      reclamation: 'REC_Id',
      audit: 'AU_Id',
      paq: 'PAQ_Id',
      indicator: 'IND_Id'
    };
    return modelPrefixes[model] || 'id'; // 'id' par défaut si non listé
  }

  // Lecture filtrée par Tenant
  async findAll(model: string, tenantId: string) {
    return (this.prisma[model] as any).findMany({
      where: { tenantId },
      // On retire le orderBy générique car les noms de colonnes dates varient
    });
  }

  // Création sécurisée
  async create(model: string, tenantId: string, data: any) {
    return (this.prisma[model] as any).create({
      data: { ...data, tenantId },
    });
  }

  // Mise à jour avec vérification de propriété
  async update(model: string, id: string, tenantId: string, data: any) {
    const pk = this.getPrimaryKeyName(model);
    
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) throw new NotFoundException(`Enregistrement introuvable dans votre organisation.`);

    return (this.prisma[model] as any).update({
      where: { [pk]: id },
      data,
    });
  }

  // Suppression sécurisée
  async delete(model: string, id: string, tenantId: string) {
    const pk = this.getPrimaryKeyName(model);
    
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) throw new NotFoundException(`Suppression impossible : accès refusé.`);

    return (this.prisma[model] as any).delete({ 
      where: { [pk]: id } 
    });
  }
}