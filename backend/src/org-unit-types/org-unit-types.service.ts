import { Injectable } from '@nestjs/common';
import { GenericCrudService } from '../common/generic-crud.service';

/**
 * 🏛️ SERVICE TYPES D'UNITÉS (§7.1.2)
 * Gère les catégories de structure (Direction, Service, etc.) de manière isolée par Tenant.
 */
@Injectable()
export class OrgUnitTypesService {
  private readonly model = 'orgUnitType';

  constructor(private genericCrud: GenericCrudService) {}

  async findAll(tenantId: string) {
    // Utilisation du GenericCrud pour garantir le filtrage par tenantId et OUT_IsActive: true
    return this.genericCrud.findAll(this.model, tenantId);
  }

  async create(tenantId: string, data: any) {
    return this.genericCrud.create(this.model, tenantId, data);
  }

  async update(id: string, tenantId: string, data: any) {
    return this.genericCrud.update(this.model, id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    // Soft delete via GenericCrud (OUT_IsActive = false)
    return this.genericCrud.delete(this.model, id, tenantId);
  }
}