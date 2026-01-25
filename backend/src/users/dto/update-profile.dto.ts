import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() 
  @IsString()
  U_FirstName?: string; // Optionnel, donc le '?' suffit ici

  @IsOptional() 
  @IsString()
  U_LastName?: string;

  @IsOptional() 
  @IsEmail({}, { message: "Format d'email invalide" })
  U_Email?: string;
}