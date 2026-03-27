/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📝 DTO : UpdateTenantDto
 * RÔLE : Validation des données de mise à jour d'un tenant
 */

import { IsString, IsOptional, IsBoolean, IsArray, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'Nom du tenant', example: 'SAGAM GIE' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email de contact', example: 'contact@sagam.sn' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Téléphone', example: '+221 77 441 09 02' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Adresse physique' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Date d\'expiration (alias pour T_SubscriptionEndDate)' })
  @IsString()
  @IsOptional()
  T_ExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Statut du tenant', enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({ description: 'Couleur principale (hex)', example: '#3b82f6' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Couleur secondaire (hex)', example: '#1e40af' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Logo URL', example: '/assets/logo-sagam.png' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: 'Modules activés', example: ['QHSE', 'FINANCE', 'RH'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modules?: string[];

  @ApiPropertyOptional({ description: 'Jours restants de la période d\'essai' })
  @IsOptional()
  trialDaysRemaining?: number;

  @ApiPropertyOptional({ description: 'Date de fin d\'abonnement' })
  @IsString()
  @IsOptional()
  subscriptionEndDate?: string;

  @ApiPropertyOptional({ description: 'Actif ou non' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes internes' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  internalNotes?: string;
}