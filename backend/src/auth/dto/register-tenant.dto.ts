import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  ceoName!: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName!: string; // 👈 Corrigé selon ta capture Payload

  @IsString()
  @IsNotEmpty()
  adminLastName!: string;  // 👈 Corrigé selon ta capture Payload

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