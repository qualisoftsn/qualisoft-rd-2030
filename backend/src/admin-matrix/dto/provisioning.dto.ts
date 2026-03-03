import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ProvisioningDto {
  @IsString() @IsNotEmpty()
  companyName: string;

  @IsString() @IsNotEmpty()
  customSlug: string; // ex: "sagam"

  @IsString() @IsNotEmpty()
  ceoName: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(8)
  adminPassword: string;

  @IsString() @IsNotEmpty()
  adminFirstName: string;

  @IsString() @IsNotEmpty()
  adminLastName: string;

  @IsString() @IsOptional()
  phone?: string;

  @IsString() @IsOptional()
  address?: string;
}