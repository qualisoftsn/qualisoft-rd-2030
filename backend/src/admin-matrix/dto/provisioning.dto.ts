import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty({ message: "Le nom de l'entreprise est requis." })
  @IsString()
  companyName!: string;

  @IsNotEmpty({ message: "Le nom du DG (CEO) est requis." })
  @IsString()
  ceoName!: string;

  @IsNotEmpty({ message: "L'email racine du tenant est requis." })
  @IsEmail({}, { message: "Format d'email invalide." })
  email!: string;

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

  @IsOptional()
  @IsString()
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
  password?: string;
}