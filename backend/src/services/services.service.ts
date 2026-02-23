import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

/**
 * SERVICE DES UNITÉS ORGANIQUES (SERVICES)
 * Gère l'arborescence structurelle de chaque Tenant.
 */
@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Création d'une OrgUnit avec gestion rigoureuse des relations Prisma
   */
  async create(tenantId: string, data: CreateServiceDto) {
    try {
      this.logger.log(`🧬 Tentative de création de l'unité : ${data.OU_Name}`);

      return await this.prisma.orgUnit.create({
        data: {
          OU_Name: data.OU_Name,
          // 🛡️ Isolation multi-tenant forcée via le Token
          tenant: { connect: { T_Id: tenantId } },
          
          // 🔗 Liaisons relationnelles obligatoires
          OU_Type: { connect: { OUT_Id: data.OU_TypeId } },
          OU_Site: { connect: { S_Id: data.OU_SiteId } },
          
          // 🌳 Liaison hiérarchique optionnelle (Parent/Child)
          ...(data.OU_ParentId && {
            OU_Parent: { connect: { OU_Id: data.OU_ParentId } }
          }),
        },
        include: {
          OU_Type: true,
          OU_Site: true,
          OU_Parent: true
        }
      });
    } catch (error: unknown) {
      // ✅ Correction de l'erreur TS18046 (Type Unknown)
      const errorMessage = error instanceof Error ? error.message : "Erreur Prisma inconnue";
      const errorStack = error instanceof Error ? error.stack : "";

      this.logger.error(`❌ Échec de création d'unité : ${errorMessage}`);
      this.logger.debug(errorStack);

      // On lève une exception NestJS propre pour le Frontend
      throw new InternalServerErrorException(
        `Impossible de créer l'unité organique. Vérifiez que le Type d'unité (${data.OU_TypeId}) et le Site (${data.OU_SiteId}) existent dans notre instance.`
      );
    }
  }

  /**
   * Récupération de l'arborescence complète pour un Tenant spécifique
   */
  async findAll(tenantId: string) {
    try {
      return await this.prisma.orgUnit.findMany({
        where: { 
          tenantId: tenantId,
          OU_IsActive: true 
        },
        include: { 
          OU_Type: true,
          OU_Site: true,
          OU_Parent: true 
        },
        orderBy: { OU_Name: 'asc' }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de lecture";
      this.logger.error(`❌ Erreur lors de la récupération des services : ${errorMessage}`);
      throw new InternalServerErrorException("Erreur lors de la récupération de la structure organique.");
    }
  }
}