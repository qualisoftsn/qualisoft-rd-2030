import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'L\'adresse email U_Email doit être valide' })
  U_Email!: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe U_Password doit contenir au moins 6 caractères' })
  U_Password!: string;
}