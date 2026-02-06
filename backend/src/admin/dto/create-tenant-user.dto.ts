import { IsString, IsEmail, IsNotEmpty, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateTenantUserDto {
  @IsString() @IsNotEmpty() U_FirstName!: string;
  @IsString() @IsNotEmpty() U_LastName!: string;
  @IsEmail() @IsNotEmpty() U_Email!: string;
  @IsEnum(Role) @IsNotEmpty() U_Role!: Role;
  @IsUUID() @IsNotEmpty() tenantId!: string;
  @IsString() @IsOptional() U_PasswordHash?: string;
}