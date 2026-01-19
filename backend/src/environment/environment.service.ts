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

  /** ✅ RELEVÉ DE CONSOMMATION (Énergie, Eau, Carburant) */
  async createConsumption(data: any, T_Id: string, U_Id: string) {
    // Note : Assure-toi que le modèle 'consumption' est ajouté à ton prisma.schema
    return (this.prisma as any).consumption.create({
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
  }

  /** ✅ ENREGISTREMENT DÉCHETS (ISO 14001) */
  async createWaste(data: any, T_Id: string) {
    // Note : Assure-toi que le modèle 'waste' est ajouté à ton prisma.schema
    return (this.prisma as any).waste.create({
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
  }

  /** 📊 BILAN IMPACT (Pour ExportService) */
  async getEnvironmentalImpact(T_Id: string, month: number, year: number) {
    const [consos, wastes] = await Promise.all([
      (this.prisma as any).consumption.findMany({ where: { tenantId: T_Id, CON_Month: month, CON_Year: year } }),
      (this.prisma as any).waste.findMany({ where: { tenantId: T_Id, WAS_Month: month, WAS_Year: year } })
    ]);

    // Calcul de l'empreinte carbone simplifiée (Facteurs d'émission stubs)
    const totalCo2 = consos.reduce((acc: number, c: any) => acc + (c.CON_Value * 0.45), 0); 

    return { month, year, consos, wastes, totalCo2 };
  }

  /** 🖋️ VALIDATION PKI DU RAPPORT MENSUEL */
  async validateMonth(T_Id: string, month: number, year: number, U_Id: string) {
    const entityId = `ENV-${T_Id}-${month}-${year}`;
    this.logger.log(`🔐 Validation environnementale : ${entityId}`);
    return this.pkiService.sign(entityId, 'ENV_REPORT', U_Id, T_Id);
  }
}