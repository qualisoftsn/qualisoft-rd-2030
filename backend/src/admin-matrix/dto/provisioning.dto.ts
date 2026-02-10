import { IsEmail, IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty() 
  @IsString()
  companyName!: string; // ✅ Ajout du ! ici

  @IsNotEmpty() 
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { 
    message: 'Le domaine doit être en minuscules, sans espaces ni caractères spéciaux (sauf tirets).' 
  })
  domain!: string; // ✅ Ajout du ! ici

  @IsNotEmpty() 
  @IsEmail()
  admin1Email!: string; // ✅ Ajout du ! ici

  @IsNotEmpty() 
  @IsEmail()
  admin2Email!: string; // ✅ Ajout du ! ici

  @IsOptional()
  @IsString()
  defaultPassword?: string; // Le ? suffit ici car c'est optionnel
}