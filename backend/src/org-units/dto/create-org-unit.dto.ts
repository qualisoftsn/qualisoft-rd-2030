import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateOrgUnitDto {
  @IsString()
  OU_Name!: string;

  @IsUUID()
  OU_TypeId!: string; // 👈 On remplace OU_Type par l'ID de la table de paramétrage

  @IsUUID()
  OU_SiteId!: string;

  @IsOptional()
  @IsUUID()
  OU_ParentId?: string;
}