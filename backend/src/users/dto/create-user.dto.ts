import { IsEmail, IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  U_Email!: string;

  @IsString()
  U_PasswordHash!: string;

  @IsString()
  @IsOptional()
  U_FirstName?: string;

  @IsString()
  @IsOptional()
  U_LastName?: string;

  @IsEnum(Role)
  U_Role!: Role;

  @IsUUID()
  U_SiteId!: string; // Liste déroulante des sites

  @IsUUID()
  @IsOptional()
  U_OrgUnitId?: string; // Liste déroulante des Unités Organiques
}