import { PrismaService } from '../prisma/prisma.service';

export abstract class BaseService {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Injecte le tenantId de manière sécurisée dans les clauses WHERE
   */
  protected withTenant(tenantId: string, where: any = {}) {
    return { ...where, tenantId };
  }

  /**
   * Prépare les données de création en forçant le tenantId
   */
  protected dataWithTenant(tenantId: string, data: any) {
    return { ...data, tenantId };
  }
}