import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format email invalide.' })
  @IsNotEmpty({ message: "L'email est requis." })
  email!: string; // ✅ Aligné sur ta charge utile

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password!: string; // ✅ Aligné sur ta charge utile

  @IsString()
  @IsOptional()
  tenantId?: string;
}