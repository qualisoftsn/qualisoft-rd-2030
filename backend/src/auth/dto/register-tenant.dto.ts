// backend/src/auth/dto/register-tenant.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterTenantDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  companyName!: string;

  @IsString()
  @IsOptional()
  sector?: string;
}