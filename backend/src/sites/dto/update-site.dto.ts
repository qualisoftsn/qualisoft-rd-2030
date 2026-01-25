import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteDto } from './create-site.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSiteDto extends PartialType(CreateSiteDto) {
  @IsOptional()
  @IsBoolean()
  S_IsActive?: boolean;
}