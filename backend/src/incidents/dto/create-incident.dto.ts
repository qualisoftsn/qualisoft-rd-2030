import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsUUID, IsISO8601 } from 'class-validator';
import { SSEType } from '@prisma/client';

export class CreateIncidentDto {
  @IsEnum(SSEType)
  SSE_Type!: SSEType;

  @IsISO8601()
  SSE_DateEvent!: string;

  @IsString()
  SSE_Lieu!: string;

  @IsString()
  SSE_Description!: string;

  @IsBoolean()
  @IsOptional()
  SSE_AvecArret?: boolean;

  @IsNumber()
  @IsOptional()
  SSE_NbJoursArret?: number;

  @IsUUID()
  SSE_SiteId!: string;

  @IsUUID()
  SSE_ReporterId!: string;

  @IsUUID()
  @IsOptional()
  SSE_VictimId?: string;

  @IsUUID()
  @IsOptional()
  SSE_ProcessusId?: string;
}