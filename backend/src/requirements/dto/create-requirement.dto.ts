import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequirementDto {
  @ApiProperty({ description: 'Titre de l\'exigence réglementaire' })
  @IsString()
  @IsNotEmpty()
  RR_Title!: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsString()
  @IsOptional()
  RR_Description?: string;

  @ApiProperty({ description: 'Catégorie (ENVIRONNEMENT, SECURITE, SOCIAL...)' })
  @IsString()
  @IsNotEmpty()
  RR_Category!: string;

  @ApiProperty({ description: 'Type (LOI, DECRET, ARRETE...)' })
  @IsString()
  @IsNotEmpty()
  RR_Type!: string;

  @ApiProperty({ description: 'Référence officielle du texte' })
  @IsString()
  @IsNotEmpty()
  RR_Reference!: string;

  @ApiProperty({ description: 'Autorité compétente (Ministère, Direction...)' })
  @IsString()
  @IsNotEmpty()
  RR_Authority!: string;

  @ApiProperty({ description: 'Date d\'échéance' })
  @IsDateString()
  @IsNotEmpty()
  RR_DueDate!: string; // Reçu en string (ISO), converti en Date dans le service

  @ApiPropertyOptional({ description: 'Fréquence de récurrence en mois' })
  @IsNumber()
  @IsOptional()
  RR_Frequency?: number;

  @ApiPropertyOptional({ description: 'Priorité (LOW, MEDIUM, HIGH, CRITICAL)' })
  @IsString()
  @IsOptional()
  RR_Priority?: string;

  @ApiPropertyOptional({ description: 'Est-ce une obligation récurrente ?' })
  @IsBoolean()
  @IsOptional()
  RR_IsRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Créer automatiquement une alerte ?' })
  @IsBoolean()
  @IsOptional()
  createAlert?: boolean;
}