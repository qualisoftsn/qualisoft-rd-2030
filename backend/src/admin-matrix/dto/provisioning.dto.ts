import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty({ message: "Le nom de l'entité est requis." })
  @IsString()
  companyName!: string;

  @IsNotEmpty({ message: "Le nom court (slug) est requis pour le sous-domaine." })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "Le slug ne doit contenir que des minuscules, chiffres et tirets." })
  customSlug!: string;

  @IsNotEmpty({ message: "Le leadership (CEO/DG) est requis." })
  @IsString()
  ceoName!: string;

  @IsNotEmpty({ message: "L'email racine est obligatoire." })
  @IsEmail({}, { message: "Format d'email invalide." })
  email!: string;

  @IsNotEmpty({ message: "Le mot de passe de l'administrateur est requis." })
  @IsString()
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
  adminPassword!: string;

  @IsNotEmpty({ message: "Le prénom de l'administrateur est requis." })
  @IsString()
  adminFirstName!: string;

  @IsNotEmpty({ message: "Le nom de l'administrateur est requis." })
  @IsString()
  adminLastName!: string;

  @IsNotEmpty({ message: "Le numéro de téléphone est requis." })
  @IsString()
  phone!: string;

  @IsNotEmpty({ message: "L'adresse physique est requise." })
  @IsString()
  address!: string;
}