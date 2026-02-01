import { IsEnum, IsString, IsDate, IsBoolean, IsOptional, Min, IsUUID } from 'class-validator';
import { SSEType } from '@prisma/client';

export class CreateSseEventDto {
  @IsEnum(SSEType)
  SSE_Type!: SSEType;

  @IsDate()
  SSE_DateEvent!: Date;

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
}