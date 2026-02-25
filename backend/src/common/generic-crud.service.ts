import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 🛠️ SERVICE GÉNÉRIQUE QUALISOFT (§7.1.3)
 * Centralise l'intelligence de persistance pour tous les modules du SMI.
 * Garantit l'isolation Multi-Tenant et le cycle de vie des données (Soft-Delete).
 */
@Injectable()
export class GenericCrudService {
  private readonly logger = new Logger(GenericCrudService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🗺️ CARTOGRAPHIE DES MÉTADONNÉES
   * Définit les clés primaires et les indicateurs d'activité par modèle.
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
   * 🧹 PRÉPARATION DES DONNÉES (Sanitization)
   * Nettoie les objets pour éviter les erreurs Prisma sur les relations complexes.
   */
  private prepareData(model: string, data: any) {
    const { pk } = this.getModelMetadata(model);
    const cleanData = { ...data };

    // Protection : On ne doit jamais injecter la PK ou le tenantId manuellement
    delete cleanData[pk];
    delete cleanData.tenantId;

    // Nettoyage des champs de tunneling ou objets imbriqués provenant du frontend
    if (model !== 'user') {
      delete cleanData.U_AssignedProcessId;
    }

    // Suppression récursive des objets de relation chargés par "include"
    Object.keys(cleanData).forEach(key => {
      if (
        cleanData[key] && 
        typeof cleanData[key] === 'object' && 
        !Array.isArray(cleanData[key]) && 
        !(cleanData[key] instanceof Date)
      ) {
        delete cleanData[key];
      }
    });

    return cleanData;
  }

  /**
   * 🔍 LECTURE : Recherche Multi-Tenant
   */
  async findAll(model: string, tenantId: string, includeArchived = false) {
    const { active } = this.getModelMetadata(model);
    this.logger.debug(`[FIND-ALL] Modèle: ${model} | Tenant: ${tenantId}`);

    return (this.prisma[model] as any).findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { [active]: true }) 
      }
    });
  }

  /**
   * 🏗️ CRÉATION : Enregistrement avec Soft-Activation
   */
  async create(model: string, tenantId: string, data: any) {
    const { active } = this.getModelMetadata(model);
    const sanitizedData = this.prepareData(model, data);
    
    this.logger.log(`[CREATE] Nouveau ${model} pour Tenant: ${tenantId}`);

    try {
      return await (this.prisma[model] as any).create({
        data: { 
          ...sanitizedData, 
          tenantId,
          [active]: true 
        },
      });
    } catch (error: any) {
      const msg = error?.message || 'Erreur Kernel inconnue';
      this.logger.error(`[CREATE-ERROR] ${model}: ${msg}`);
      throw new BadRequestException(`Échec de création ${model} : ${msg}`);
    }
  }

  /**
   * 🔄 MISE À JOUR : Modification sécurisée par appartenance
   */
  async update(model: string, id: string, tenantId: string, data: any) {
    const { pk } = this.getModelMetadata(model);
    const sanitizedData = this.prepareData(model, data);
    
    // Vérification de propriété
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) {
      throw new NotFoundException(`Ressource ${model} (${id}) introuvable ou hors périmètre.`);
    }

    this.logger.log(`[UPDATE] Mise à jour ${model} ID: ${id}`);

    try {
      return await (this.prisma[model] as any).update({
        where: { [pk]: id },
        data: sanitizedData,
      });
    } catch (error: any) {
      const msg = error?.message || 'Erreur Kernel inconnue';
      this.logger.error(`[UPDATE-ERROR] ${model}: ${msg}`);
      throw new BadRequestException(`Échec de mise à jour ${model} : ${msg}`);
    }
  }

  /**
   * 📁 ARCHIVAGE (SOFT-DELETE)
   */
  async delete(model: string, id: string, tenantId: string) {
    const { pk, active } = this.getModelMetadata(model);
    
    const record = await (this.prisma[model] as any).findFirst({
      where: { [pk]: id, tenantId },
    });
    
    if (!record) {
      throw new NotFoundException(`Archivage impossible : Périmètre invalide.`);
    }

    this.logger.warn(`[SOFT-DELETE] Archivage de ${model} ID: ${id}`);

    return (this.prisma[model] as any).update({ 
      where: { [pk]: id },
      data: { [active]: false }
    });
  }
}