import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsUUID, MaxLength } from 'class-validator';
import { DocCategory } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @MaxLength(255)
  DOC_Title: string = '';

  @IsString()
  @IsOptional()
  DOC_Description?: string;

  @IsEnum(DocCategory)
  @IsOptional()
  DOC_Category?: DocCategory = DocCategory.PROCEDURE;

  @IsUUID()
  @IsOptional()
  DOC_ProcessusId?: string;

  @IsUUID()
  @IsOptional()
  DOC_SiteId?: string;

  @IsNumber()
  @IsOptional()
  DOC_ReviewFrequencyMonths?: number = 12;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  DOC_Tags?: string[] = [];

  @IsString()
  @IsOptional()
  DOC_Department?: string;
}