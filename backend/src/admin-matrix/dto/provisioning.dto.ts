import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty() @IsString() companyName!: string;
  @IsNotEmpty() @IsString() ceoName!: string;
  @IsNotEmpty() @IsEmail() email!: string;
  @IsNotEmpty() @IsString() adminFirstName!: string;
  @IsNotEmpty() @IsString() adminLastName!: string;
  @IsNotEmpty() @IsString() phone!: string;
  @IsNotEmpty() @IsString() address!: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}