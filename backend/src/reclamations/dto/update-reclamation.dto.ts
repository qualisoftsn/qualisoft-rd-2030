import { PartialType } from '@nestjs/mapped-types';
import { CreateReclamationDto } from './create-reclamation.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ReclamationStatus } from '@prisma/client';

export class UpdateReclamationDto extends PartialType(CreateReclamationDto) {
  @IsOptional()
  @IsEnum(ReclamationStatus)
  REC_Status?: ReclamationStatus;

  @IsOptional()
  @IsString()
  REC_SolutionProposed?: string;

  @IsOptional()
  @IsString()
  REC_PreuveUrl?: string;

  @IsOptional()
  @IsString()
  REC_PreuveName?: string;
}