import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PkiService } from '../pki/pki.service';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(
    private prisma: PrismaService,
    private pkiService: PkiService
  ) {}

  /**
   * ✅ CRÉATION D'UNE CONSOMMATION
   */
  async createConsumption(data: any, T_Id: string, U_Id: string) {
    try {
      return await this.prisma.consumption.create({
        data: {
          CON_Type: data.CON_Type,
          CON_Value: parseFloat(data.CON_Value),
          CON_Unit: data.CON_Unit,
          CON_Month: parseInt(data.CON_Month),
          CON_Year: parseInt(data.CON_Year),
          CON_Cost: data.CON_Cost ? parseFloat(data.CON_Cost) : null,
          tenantId: T_Id,
          CON_CreatorId: U_Id,
          CON_SiteId: data.CON_SiteId,
        }
      });
    } catch (error: any) { // ✅ Correction : Typage explicite en 'any' ou vérification d'instance
      this.logger.error(`Erreur création consommation: ${error?.message || error}`);
      throw new BadRequestException("Données de consommation invalides ou Site introuvable.");
    }
  }

  /**
   * ✅ ENREGISTREMENT PESÉE DÉCHETS
   */
  async createWaste(data: any, T_Id: string) {
    try {
      return await this.prisma.waste.create({
        data: {
          WAS_Label: data.WAS_Label,
          WAS_Weight: parseFloat(data.WAS_Weight),
          WAS_Type: data.WAS_Type, 
          WAS_Treatment: data.WAS_Treatment,
          WAS_Month: parseInt(data.WAS_Month),
          WAS_Year: parseInt(data.WAS_Year),
          tenantId: T_Id,
          WAS_SiteId: data.WAS_SiteId
        }
      });
    } catch (error: any) { // ✅ Correction : Typage explicite
      this.logger.error(`Erreur création déchet: ${error?.message || error}`);
      throw new BadRequestException("Données de déchets invalides.");
    }
  }

  /**
   * 📊 BILAN IMPACT ENVIRONNEMENTAL
   */
  async getEnvironmentalImpact(T_Id: string, month: number, year: number) {
    const [consos, wastes] = await Promise.all([
      this.prisma.consumption.findMany({ 
        where: { tenantId: T_Id, CON_Month: month, CON_Year: year },
        include: { CON_Site: { select: { S_Name: true } } } 
      }),
      this.prisma.waste.findMany({ 
        where: { tenantId: T_Id, WAS_Month: month, WAS_Year: year },
        include: { WAS_Site: { select: { S_Name: true } } }
      })
    ]);

    const totalCo2 = consos.reduce((acc, c) => acc + (c.CON_Value * 0.45), 0); 

    return { 
      month, 
      year, 
      consos, 
      wastes, 
      totalCo2: parseFloat(totalCo2.toFixed(2)),
      wasteCount: wastes.length
    };
  }

  /**
   * 🖋️ VALIDATION PKI
   */
  async validateMonth(T_Id: string, month: number, year: number, U_Id: string) {
    const entityId = `ENV-${T_Id}-${month}-${year}`;
    return this.pkiService.sign(entityId, 'ENV_REPORT', U_Id, T_Id);
  }
}