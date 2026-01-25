import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgUnitDto } from './create-org-unit.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrgUnitDto extends PartialType(CreateOrgUnitDto) {
  @IsOptional()
  @IsBoolean()
  OU_IsActive?: boolean;
}