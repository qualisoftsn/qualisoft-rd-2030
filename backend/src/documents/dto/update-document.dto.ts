import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DocStatus } from '@prisma/client';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsEnum(DocStatus)
  @IsOptional()
  DOC_Status?: DocStatus;
}