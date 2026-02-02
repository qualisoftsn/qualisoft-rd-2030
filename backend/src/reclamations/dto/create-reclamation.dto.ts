import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateReclamationDto {
  @IsString()
  @IsNotEmpty()
  REC_Object!: string;

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
  @IsDateString() // ✅ Force le format ISO pour éviter les crashs de date
  REC_Deadline?: string | Date;
}