import { 
  IsString, 
  IsInt, 
  IsOptional, 
  Min, 
  Max, 
  IsEnum, 
  IsDate, 
  IsArray, 
  ArrayMinSize,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { RiskStatus, ProcessFamily } from '@prisma/client';

export class RiskActionDto {
  @IsString()
  ACT_Title!: string;

  @IsString()
  ACT_PAQId!: string;


  @IsEnum(['CORRECTIVE', 'PREVENTIVE', 'AMELIORATION'])
  ACT_Type!: string;

  @IsString()
  ACT_ResponsableId!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  ACT_Deadline?: Date;

  @IsOptional()
  @IsString()
  ACT_Description?: string;
}

export class CreateRiskDto {
  @IsString()
  RS_Libelle!: string;

  @IsOptional()
  @IsString()
  RS_Activite?: string;

  @IsOptional()
  @IsString()
  RS_Tache?: string;

  @IsOptional()
  @IsString()
  RS_Causes?: string;

  @IsOptional()
  @IsString()
  RS_Description?: string;

  @IsInt()
  @Min(1)
  @Max(4)
  RS_Probabilite!: number;

  @IsInt()
  @Min(1)
  @Max(4)
  RS_Gravite!: number;

  @IsInt()
  @Min(1)
  @Max(4)
  RS_Maitrise!: number;

  @IsString()
  RS_ProcessusId!: string;

  @IsString()
  RS_TypeId!: string;

  @IsOptional()
  @IsString()
  RS_Mesures?: string;

  @IsOptional()
  @IsString()
  RS_Acteurs?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  RS_NextReview?: Date;

  @IsOptional()
  @IsEnum(RiskStatus)
  RS_Status?: RiskStatus;

  @IsOptional()
  @IsString()
  RS_Contexte?: string; // Contexte interne/externe (ISO 9001 §4)

  @IsOptional()
  @IsString()
  RS_PartiesInteressees?: string; // Parties concernées (ISO 9001 §4.2)

  @IsOptional()
  @IsString()
  RS_ExigencesLegales?: string; // Exigences réglementaires (ISO 9001 §6.1.3)

  @IsOptional()
  @IsString()
  RS_Opportunite?: string; // Opportunités associées (ISO 9001 §6.1)

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => RiskActionDto)
  actions?: RiskActionDto[];
}