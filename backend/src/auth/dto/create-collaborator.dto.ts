import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateCollaboratorDto {
  @IsEmail({}, { message: 'Email professionnel invalide.' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role = Role.USER;

  @IsString()
  @IsOptional()
  password?: string;
}