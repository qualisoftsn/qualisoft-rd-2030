import { IsNotEmpty, IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

/**
 * DTO DE CRÉATION D'UNITÉ ORGANIQUE
 * Verrouille les entrées pour la structure organisationnelle Qualisoft.
 */
export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom de l'unité (OU_Name) est obligatoire." })
  @MinLength(2, { message: "Le nom de l'unité doit contenir au moins 2 caractères." })
  OU_Name!: string;

  @IsUUID('4', { message: "L'identifiant du type d'unité (OU_TypeId) doit être un UUID valide." })
  @IsNotEmpty({ message: "Le type d'unité est obligatoire." })
  OU_TypeId!: string;

  @IsUUID('4', { message: "L'identifiant du site (OU_SiteId) doit être un UUID valide." })
  @IsNotEmpty({ message: "Le site de rattachement est obligatoire." })
  OU_SiteId!: string;

  @IsOptional()
  @IsUUID('4', { message: "L'identifiant du parent (OU_ParentId) doit être un UUID valide." })
  OU_ParentId?: string;
}