import { IsString, IsUUID, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateOrgUnitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  OU_Name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  OU_Code!: string; // Ajouté car indispensable pour le maillage SDE

  @IsUUID()
  @IsNotEmpty()
  OU_TypeId!: string;

  @IsUUID()
  @IsNotEmpty()
  OU_SiteId!: string;

  @IsOptional()
  @IsUUID()
  OU_ParentId?: string | null;
}