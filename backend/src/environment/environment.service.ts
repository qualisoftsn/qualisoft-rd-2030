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

  // ======================================================
  // 📈 ZONE 1 : GESTION DES CONSOMMATIONS (EAU, ÉLEC, GAZ)
  // ======================================================

  /**
   * ✅ CRÉATION D'UN RELEVÉ DE CONSOMMATION
   * Calcule automatiquement le ratio de performance (ex: kWh/unité produite)
   */
  async createConsumption(data: any, T_Id: string, U_Id: string) {
    return this.prisma.consumption.create({
      data: {
        CON_Type: data.CON_Type, // 'ELECTRICITE' | 'EAU' | 'GAZ' | 'CARBURANT'
        CON_Value: parseFloat(data.CON_Value),
        CON_Unit: data.CON_Unit,
        CON_Month: data.CON_Month,
        CON_Year: data.CON_Year,
        CON_Cost: data.CON_Cost ? parseFloat(data.CON_Cost) : null,
        tenantId: T_Id,
        CON_CreatorId: U_Id,
        CON_SiteId: data.CON_SiteId,
      }
    });
  }

  // ======================================================
  // ♻️ ZONE 2 : GESTION DES DÉCHETS (ISO 14001)
  // ======================================================

  /**
   * ✅ ENREGISTREMENT PESÉE DÉCHETS
   * Suivi par filière de valorisation (Recyclage, Incinération, Décharge)
   */
  async createWaste(data: any, T_Id: string) {
    return this.prisma.waste.create({
      data: {
        WAS_Label: data.WAS_Label,
        WAS_Weight: parseFloat(data.WAS_Weight),
        WAS_Type: data.WAS_Type, // 'DANGEREUX' | 'BANAL'
        WAS_Treatment: data.WAS_Treatment, // 'RECYCLAGE' | 'VALORISATION' | 'ELIMINATION'
        WAS_Month: data.WAS_Month,
        WAS_Year: data.WAS_Year,
        tenantId: T_Id,
        WAS_SiteId: data.WAS_SiteId
      }
    });
  }

  // ======================================================
  // 🌍 ZONE 3 : ANALYSE & SIGNATURE PKI
  // ======================================================

  /**
   * 📊 BILAN ENVIRONNEMENTAL MENSUEL
   * Agrégation des données pour la Revue de Direction
   */
  async getEnvironmentalImpact(T_Id: string, month: number, year: number) {
    const [consos, wastes] = await Promise.all([
      this.prisma.consumption.findMany({ where: { tenantId: T_Id, CON_Month: month, CON_Year: year } }),
      this.prisma.waste.findMany({ where: { tenantId: T_Id, WAS_Month: month, WAS_Year: year } })
    ]);

    // Calcul simple de l'empreinte carbone (Stubs de facteurs d'émission)
    const co2Impact = consos.reduce((acc, c) => acc + (c.CON_Value * 0.5), 0); // kWh -> CO2 stub

    return { month, year, consos, wastes, totalCo2: co2Impact };
  }

  /**
   * 🖋️ VALIDATION OFFICIELLE (PKI)
   * Verrouille les données environnementales du mois
   */
  async validateMonth(T_Id: string, month: number, year: number, U_Id: string) {
    const entityId = `ENV-${T_Id}-${month}-${year}`;
    return this.pkiService.sign(entityId, 'ENV_REPORT', U_Id, T_Id);
  }
}