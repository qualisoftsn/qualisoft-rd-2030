import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTenantDto {
  // Champs pour la table TENANT
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  ceoName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  // Champs pour la table USER (L'administrateur)
  @IsString()
  @IsNotEmpty()
  firstName!: string; // 👈 Le message "firstName should not be empty" vient d'ici

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}