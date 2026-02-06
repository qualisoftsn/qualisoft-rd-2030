import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from '@prisma/client';

/**
 * DTO de création de Réclamation (§8.2 ISO 9001)
 * Validation stricte des entrées pour garantir l'intégrité des données Qualisoft
 */
export class CreateReclamationDto {
  @IsString()
  @IsNotEmpty()
  REC_Object!: string; // 🛡️ Le "!" corrige l'erreur TS2564

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
  REC_Gravity?: Priority = Priority.MEDIUM;

  @IsOptional()
  @IsString()
  REC_Source?: string = 'DIRECT';

  @IsOptional()
  @Type(() => Date) // 🔄 Convertit automatiquement la string ISO en objet Date JS
  @IsDate()
  REC_Deadline?: Date;
}