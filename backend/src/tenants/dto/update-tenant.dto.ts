import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional()
  @IsBoolean()
  T_IsActive?: boolean; // Pour l'archivage manuel si besoin
}