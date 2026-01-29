import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ObjectiveStatus } from '@prisma/client';

export class QueryObjectivesDto {
  @IsEnum(ObjectiveStatus)
  @IsOptional()
  status?: ObjectiveStatus;

  @IsUUID()
  @IsOptional()
  processus?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  dateRange?: 'all' | 'overdue' | 'upcoming';
}