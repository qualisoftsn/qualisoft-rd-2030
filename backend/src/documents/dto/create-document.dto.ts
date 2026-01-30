import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsUUID, MaxLength, Min, IsNotEmpty } from 'class-validator';
import { DocCategory } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  DOC_Title: string = '';

  @IsString()
  @IsOptional()
  DOC_Description?: string;

  @IsEnum(DocCategory, { message: "La catégorie doit être conforme au référentiel ISO (PROCEDURE, MANUEL, etc.)" })
  @IsOptional()
  DOC_Category?: DocCategory = DocCategory.PROCEDURE;

  @IsUUID('4', { message: "L'ID du processus doit être un UUID valide." })
  @IsOptional()
  DOC_ProcessusId?: string;

  @IsUUID('4', { message: "L'ID du site doit être un UUID valide." })
  @IsOptional()
  DOC_SiteId?: string;

  @IsNumber()
  @Min(1)
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