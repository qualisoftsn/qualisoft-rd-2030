import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty({ message: "Le nom de l'entité est requis." })
  @IsString()
  companyName!: string;

  @IsNotEmpty({ message: "Le leadership (CEO/DG) est requis." })
  @IsString()
  ceoName!: string;

  @IsNotEmpty({ message: "L'email racine est obligatoire." })
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
}