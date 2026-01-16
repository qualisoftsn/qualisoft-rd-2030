import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  ceoName!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string; // 👈 Doit correspondre au champ "firstName" du formulaire

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional() // On le met optionnel pour éviter de bloquer si vide
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}