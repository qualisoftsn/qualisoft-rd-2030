import { IsEmail, IsString, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: "Email invalide" })
  U_Email!: string;

  @IsString()
  @MinLength(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
  U_Password!: string; // Reçu en clair, sera haché par le service

  @IsString()
  @IsOptional()
  U_FirstName?: string;

  @IsString()
  @IsOptional()
  U_LastName?: string;

  @IsEnum(Role)
  U_Role!: Role;

  @IsUUID()
  U_SiteId!: string;

  @IsOptional()
  @IsUUID()
  U_OrgUnitId?: string;
}