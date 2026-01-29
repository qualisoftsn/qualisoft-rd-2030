import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, MaxLength, Min, Max } from 'class-validator';
import { ObjectiveStatus } from '@prisma/client';

export class CreateQualityObjectiveDto {
  @IsString()
  @MaxLength(255)
  QO_Title!: string; // Utilisation de ! pour le mode strict

  @IsString()
  @IsOptional()
  QO_Description?: string;

  @IsString()
  @MaxLength(500)
  QO_Target!: string;

  @IsDateString()
  QO_Deadline!: string;

  @IsUUID()
  @IsOptional()
  QO_ProcessusId?: string;

  @IsUUID()
  QO_OwnerId!: string;

  @IsEnum(ObjectiveStatus)
  @IsOptional()
  QO_Status?: ObjectiveStatus = ObjectiveStatus.BROUILLON;

  @IsOptional()
  @Min(0)
  @Max(100)
  QO_Progress?: number = 0;
}