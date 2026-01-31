import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateReclamationDto {
  @IsString()
  @IsNotEmpty()
  REC_Object!: string; // ✅ Le "!" supprime l'erreur TS2564

  @IsString()
  @IsNotEmpty()
  REC_Description!: string;

  @IsUUID()
  @IsNotEmpty()
  REC_TierId!: string;

  @IsUUID()
  @IsOptional()
  REC_ProcessusId?: string;

  @IsEnum(Priority)
  @IsOptional()
  REC_Gravity?: Priority;

  @IsOptional()
  @IsString()
  REC_Source?: string;

  @IsOptional()
  REC_Deadline?: string | Date;
}