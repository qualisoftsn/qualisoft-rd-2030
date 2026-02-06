import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from '@prisma/client';

export class CreateReclamationDto {
  @IsString() @IsNotEmpty() REC_Object: string;
  @IsString() @IsNotEmpty() REC_Description: string;
  @IsUUID() @IsNotEmpty() REC_TierId: string;
  @IsUUID() @IsOptional() REC_ProcessusId?: string;
  @IsEnum(Priority) @IsOptional() REC_Gravity?: Priority = Priority.MEDIUM;
  @IsOptional() @IsString() REC_Source?: string = 'DIRECT';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  REC_Deadline?: Date;
}