import { PartialType } from '@nestjs/mapped-types';
import { CreateReclamationDto } from './create-reclamation.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ReclamationStatus, Priority } from '@prisma/client';

/**
 * DTO de mise à jour / traitement (§8.7 Maîtrise des sorties non conformes)
 */
export class UpdateReclamationDto extends PartialType(CreateReclamationDto) {
  @IsOptional()
  @IsEnum(ReclamationStatus)
  REC_Status?: ReclamationStatus;

  @IsOptional()
  @IsString()
  REC_SolutionProposed?: string;

  @IsOptional()
  @IsString()
  REC_PreuveURL?: string;

  @IsOptional()
  @IsString()
  REC_PreuveName?: string;

  @IsOptional()
  @IsEnum(Priority)
  REC_Gravity?: Priority;
}