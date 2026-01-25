import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenericCrudService {
  private readonly logger = new Logger(GenericCrudService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🗺️ MAPPING DES PRÉFIXES (Basé sur ton Schéma du 21/01/2026)
   */
  private getModelMetadata(model: string) {
    const mapping: Record<string, { pk: string; active: string }> = {
      tenant:           { pk: 'T_Id',   active: 'T_IsActive' },
      site:             { pk: 'S_Id',   active: 'S_IsActive' },
      orgUnit:          { pk: 'OU_Id',  active: 'OU_IsActive' },
      orgUnitType:      { pk: 'OUT_Id', active: 'OUT_IsActive' },
      user:             { pk: 'U_Id',   active: 'U_IsActive' },
      processus:        { pk: 'PR_Id',  active: 'PR_IsActive' },
      processType:      { pk: 'PT_Id',  active: 'PT_IsActive' },
      action:           { pk: 'ACT_Id', active: 'ACT_IsActive' },
      paq:              { pk: 'PAQ_Id', active: 'PAQ_IsActive' },
      indicator:        { pk: 'IND_Id', active: 'IND_IsActive' },
      indicatorValue:   { pk: 'IV_Id',  active: 'IV_IsActive' },
      notification:     { pk: 'N_Id',   active: 'N_IsActive' },
      userHabilitation: { pk: 'UH_Id',  active: 'UH_IsActive' },
      risk:             { pk: 'RS_Id',  active: 'RS_IsActive' },
      riskType:         { pk: 'RT_Id',  active: 'RT_IsActive' },
      audit:            { pk: 'AU_Id',  active: 'AU_IsActive' },
      nonConformite:    { pk: 'NC_Id',  active: 'NC_IsActive' },
      reclamation:      { pk: 'REC_Id', active: 'REC_IsActive' },
      tier:             { pk: 'TR_Id',  active: 'TR_IsActive' }
    };

    return mapping[model] || { pk: 'id', active: 'isActive' };
  }

  /**
   * ✅ LECTURE : Filtre automatique par Tenant ET par état Actif
   */
  async findAll(model: string, tenantId: string, includeArchived = false) {
    const { active } = this.getModelMetadata(model);
    
    return (this.prisma[model] as any).findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { [active]: true }) 
      }
    });
  }

  /**
   * ✅ CRÉATION : Injection automatique du tenantId et du flag IsActive
   */
  async create(model: string, tenantId: string, data: any) {
    const { active } = this.getModelMetadata(model);
    
    return (this.prisma[model] as any).create({
      data: { 
        ...data, 
        tenantId,
        [active]: true 
      },
    });
  }

  /**
   * ✅ MISE À JOUR : Vérification de propriété (Ownership)
   */
  async update(model: string, id: string, tenantId: string, data: any) {
    const { pk } = this.getModelMetadata(model);
    
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) throw new NotFoundException(`Enregistrement introuvable ou accès refusé.`);

    return (this.prisma[model] as any).update({
      where: { [pk]: id },
      data,
    });
  }

  /**
   * 📁 ARCHIVAGE (SOFT DELETE) : Zéro suppression physique
   */
  async delete(model: string, id: string, tenantId: string) {
    const { pk, active } = this.getModelMetadata(model);
    
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) throw new NotFoundException(`Archivage impossible : accès refusé.`);

    this.logger.warn(`[SOFT-DELETE] Archivage logique du modèle ${model} ID: ${id}`);

    // On transforme le DELETE en un UPDATE du flag IsActive
    return (this.prisma[model] as any).update({ 
      where: { [pk]: id },
      data: { [active]: false }
    });
  }
}