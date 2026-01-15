/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller() // Le préfixe global 'api' s'applique ici automatiquement
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService
  ) {}

  @Get()
  async getHello() {
    return await this.appService.getSystemStatus();
  }

  /**
   * 🔍 TEST DE CONNEXION (URL : http://localhost:3000/api/debug/count-all)
   */
  @Get('debug/count-all') // Pas de 'api/' ici car c'est déjà dans le préfixe global
  async debugCount() {
    const ncs = await this.prisma.nonConformite.count();
    const recs = await this.prisma.reclamation.count();
    const actions = await this.prisma.action.count();
    const tenants = await this.prisma.tenant.count();
    
    return { 
      status: "VÉRIFICATION_INTERNE_QUALISOFT",
      total_tenants_en_base: tenants,
      total_ncs_en_base: ncs,
      total_recs_en_base: recs,
      total_actions_en_base: actions
    };
  }

  /**
   * 📊 COCKPIT DYNAMIQUE (URL : http://localhost:3000/api/analyses/dashboard)
   */
  @UseGuards(JwtAuthGuard)
  @Get('analyses/dashboard') // Pas de 'api/' ici
  async getDashboardData(@Req() req: any) {
    const T_Id = req.user?.tenantId;
    const now = new Date();

    if (!T_Id) {
      return { error: "Tenant ID manquant dans le Token JWT" };
    }

    const [processus, ncs, docs, actions, tenant] = await Promise.all([
      this.prisma.processus.count({ where: { tenantId: T_Id } }),
      this.prisma.nonConformite.count({ where: { tenantId: T_Id } }),
      this.prisma.document.count({ where: { tenantId: T_Id } }),
      this.prisma.action.findMany({ where: { tenantId: T_Id } }),
      this.prisma.tenant.findUnique({ where: { T_Id }, select: { T_Name: true } })
    ]);

    const total = actions.length;
    const termine = actions.filter(a => a.ACT_Status === 'TERMINEE').length;
    
    return {
      enterpriseName: tenant?.T_Name || "Organisation Qualisoft",
      counts: {
        processus: processus,
        ncs: ncs,
        docs: docs,
        sseAccidentsArret: 0 
      },
      actions: {
        total,
        termine,
        enCours: actions.filter(a => a.ACT_Status === 'EN_COURS').length,
        aFaire: actions.filter(a => a.ACT_Status === 'A_FAIRE').length,
        enRetard: actions.filter(a => a.ACT_Deadline && new Date(a.ACT_Deadline) < now && a.ACT_Status !== 'TERMINEE').length,
        tauxRealisation: total > 0 ? Math.round((termine / total) * 100) : 0
      }
    };
  }
}