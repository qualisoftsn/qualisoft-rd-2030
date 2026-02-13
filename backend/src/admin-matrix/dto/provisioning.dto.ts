import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty({ message: "Le nom de l'entité est requis." })
  @IsString()
  companyName!: string;

  @IsNotEmpty({ message: "Le nom du DG est requis." })
  @IsString()
  ceoName!: string;

  @IsNotEmpty({ message: "L'email racine est obligatoire." })
  @IsEmail({}, { message: "Format d'email invalide." })
  email!: string;

  @IsNotEmpty({ message: "Le prénom de l'admin est requis." })
  @IsString()
  adminFirstName!: string;

  @IsNotEmpty({ message: "Le nom de l'admin est requis." })
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
  @MinLength(8, { message: "Le mot de passe doit faire au moins 8 caractères." })
  password?: string;
}