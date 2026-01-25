import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateOrgUnitDto {
  @IsString()
  @MaxLength(100)
  OU_Name!: string;

  @IsUUID()
  OU_TypeId!: string; // Direction, Service, Atelier, etc.

  @IsUUID()
  OU_SiteId!: string; // Localisation physique obligatoire

  @IsOptional()
  @IsUUID()
  OU_ParentId?: string; // Pour la structure hiérarchique
}