import { IsString, IsEnum, IsOptional, IsArray, IsIn } from 'class-validator';
import { DocCategory, DocStatus } from '@prisma/client';

export class QueryDocumentsDto {
  @IsEnum(DocCategory)
  @IsOptional()
  category?: DocCategory;

  @IsEnum(DocStatus)
  @IsOptional()
  status?: DocStatus;

  @IsString()
  @IsOptional()
  processus?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsOptional()
  @IsIn(['all', 'month', 'quarter', 'overdue'])
  dateRange?: 'all' | 'month' | 'quarter' | 'overdue';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}