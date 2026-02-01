import { IsEnum, IsString, IsDate, IsBoolean, IsOptional, Min, IsUUID } from 'class-validator';
import { SSEType } from '@prisma/client';

export class CreateEnvironmentIncidentDto {
  @IsEnum(SSEType)
  SSE_Type!: SSEType;

  @IsDate()
  SSE_DateEvent!: Date | string;

  @IsString()
  SSE_Lieu!: string;

  @IsString()
  SSE_Description!: string;

  @IsBoolean()
  SSE_AvecArret!: boolean;

  @Min(0)
  SSE_NbJoursArret!: number;

  @IsUUID()
  SSE_SiteId!: string;

  @IsOptional()
  @IsUUID()
  SSE_ProcessusId?: string;

  @IsOptional()
  @IsUUID()
  SSE_ReporterId?: string;

  @IsOptional()
  @IsUUID()
  SSE_VictimId?: string;

  @IsOptional()
  @IsString()
  ENV_Contaminant?: string; // Type de polluant (eau, sol, air)

  @IsOptional()
  @IsString()
  ENV_Quantite?: string; // Quantité estimée

  @IsOptional()
  @IsString()
  ENV_ZoneImpact?: string; // Zone géographique impactée
}