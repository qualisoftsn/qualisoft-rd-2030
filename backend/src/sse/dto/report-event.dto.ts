import { 
  IsEnum, 
  IsString, 
  IsNotEmpty, 
  IsBoolean, 
  IsOptional, 
  IsInt, 
  Min, 
  IsDateString 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Définition de l'Enum pour la validation
export enum SSEType {
  ACCIDENT_TRAVAIL = 'ACCIDENT_TRAVAIL',
  ACCIDENT_TRAJET = 'ACCIDENT_TRAJET',
  PRESQU_ACCIDENT = 'PRESQU_ACCIDENT',
  SITUATION_DANGEREUSE = 'SITUATION_DANGEREUSE',
  DOMMAGE_MATERIEL = 'DOMMAGE_MATERIEL',
  INCIDENT_ENVIRONNEMENTAL = 'INCIDENT_ENVIRONNEMENTAL'
}

export class ReportEventDto {
  @ApiProperty({ enum: SSEType })
  @IsEnum(SSEType)
  type!: SSEType; // Ajout du ! ici

  @ApiProperty()
  @IsDateString()
  dateHeure!: string; // Ajout du ! ici

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lieu!: string; // Ajout du ! ici

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string; // Ajout du ! ici

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  avecArret?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  nbJoursArret?: number;
}