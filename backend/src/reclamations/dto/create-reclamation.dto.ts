import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from '@prisma/client';

export class CreateReclamationDto {
  @IsString() 
  @IsNotEmpty() 
  REC_Object!: string; // 👈 Le "!" dit à TS : "Cette valeur sera injectée"

  @IsString() 
  @IsNotEmpty() 
  REC_Description!: string; // 👈 Ici aussi

  @IsUUID() 
  @IsNotEmpty() 
  REC_TierId!: string; // 👈 Et ici

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
  @Type(() => Date)
  @IsDate()
  REC_Deadline?: Date;
}