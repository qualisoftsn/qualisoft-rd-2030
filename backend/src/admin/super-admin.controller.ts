/**
 * CHEMIN ABSOLU : /backend/src/admin/super-admin.controller.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Centre de commandement souverain pour la gestion des nœuds Matrix.
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ProvisioningService } from '../admin-matrix/provisioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MasterGuard } from '../auth/guards/master.guard';
import { AdminService } from './admin.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ProvisioningDto } from '../admin-matrix/dto/provisioning.dto';

@Controller('admin/super-admin')
@UseGuards(JwtAuthGuard, MasterGuard)
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(
    private readonly provisioningService: ProvisioningService,
    private readonly adminService: AdminService
  ) {}

  /**
   * 🛰️ BILAN DE SANTÉ DU SYSTÈME
   */
  @Get('health-check')
  async checkSystem() {
    return { 
      status: 'Elite Matrix System Online', 
      timestamp: new Date().toISOString(),
      version: '2026.1.0'
    };
  }

  /**
   * 📋 LECTURE DU REGISTRE GLOBAL
   */
  @Get('tenants')
  async getAllTenants() {
    try {
      return await this.adminService.findAllTenants();
    } catch (error: any) {
      this.logger.error(`❌ Erreur lecture registre: ${error.message}`);
      throw new InternalServerErrorException("Impossible d'accéder au registre Matrix.");
    }
  }

  /**
   * 🏗️ ACTIVATION D'UN NOUVEAU NŒUD CLIENT
   * ✅ SÉCURITÉ : Aligné sur le ProvisioningDto épuré (Zéro Password).
   */
  @Post('activate-tenant')
  @HttpCode(HttpStatus.CREATED)
  async activateTenant(@Body() data: any) {
    this.logger.log(`🚀 Amorce du provisioning souverain pour : ${data.companyName}`);

    // 1. Validation de l'intégrité minimale
    if (!data.companyName || (!data.admin1Email && !data.email)) {
      throw new BadRequestException("Données de scellage incomplètes.");
    }

    try {
      /**
       * 🔄 MAPPAGE STRICT (Zéro Password)
       * On construit l'objet en respectant scrupuleusement le ProvisioningDto 
       * pour éviter l'erreur TS2353.
       */
      const alignedData: ProvisioningDto = {
        companyName: data.companyName,
        ceoName: data.ceoName || "Direction Générale",
        email: data.admin1Email || data.email,
        adminFirstName: data.adminFirstName || "Admin",
        adminLastName: data.adminLastName || "Principal",
        phone: data.phone || "000000000",
        address: data.address || "Sénégal, Dakar",
      };

      return await this.provisioningService.initializeNewClient(alignedData);
    } catch (error: any) {
      this.logger.error(`❌ ÉCHEC ACTIVATION [${data.companyName}]: ${error.message}`);
      throw new HttpException(
        error.message || "Rupture du protocole de scellage", 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ⚙️ MISE À JOUR DES PARAMÈTRES D'UNE INSTANCE
   */
  @Patch('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    try {
      return await this.adminService.updateTenant(id, dto);
    } catch (error: any) {
      this.logger.error(`❌ Erreur mise à jour tenant ${id}: ${error.message}`);
      throw new NotFoundException("Nœud introuvable ou inaccessible.");
    }
  }

  /**
   * 🗑️ PURGE D'UNE INSTANCE DU REGISTRE
   */
  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    try {
      await this.adminService.deleteTenant(id);
      return { success: true, message: "Nœud purgé avec succès." };
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de la purge du tenant ${id}: ${error.message}`);
      throw new InternalServerErrorException("Échec de la procédure de purge.");
    }
  }

  /**
   * 🎭 PROTOCOLE D'IMPERSONATION (PRISE DE CONTRÔLE SOUVERAINE)
   */
  @Post('impersonate/:tenantId')
  async impersonate(@Param('tenantId') tenantId: string) {
    try {
      return await this.provisioningService.generateImpersonationToken(tenantId);
    } catch (error: any) {
      this.logger.error(`❌ Échec de l'impersonation sur le nœud ${tenantId}: ${error.message}`);
      throw new UnauthorizedException("Autorité Matrix refusée.");
    }
  }
}