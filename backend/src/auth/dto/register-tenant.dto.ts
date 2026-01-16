import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string; // 👈 Le "!" corrige l'erreur TS2564 (Initialiseur)

  @IsString()
  @IsNotEmpty()
  ceoName!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string; // 👈 Résout l'erreur "firstName should not be empty"

  @IsString()
  @IsNotEmpty()
  lastName!: string; // 👈 Résout l'erreur "lastName should not be empty"

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}