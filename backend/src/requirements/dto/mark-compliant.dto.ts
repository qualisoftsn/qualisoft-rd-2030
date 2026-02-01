import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkCompliantDto {
  @ApiPropertyOptional({ description: 'Lien vers la preuve de conformité' })
  @IsString()
  @IsOptional()
  evidenceUrl?: string;
}