import { IsEmail, IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

export class ProvisioningDto {
  @IsNotEmpty({ message: "Le nom de l'entreprise est obligatoire." }) 
  @IsString()
  companyName!: string;

  @IsNotEmpty({ message: "Le domaine technique est obligatoire." }) 
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { 
    message: 'Le domaine doit être en minuscules, sans espaces ni caractères spéciaux (sauf tirets).' 
  })
  domain!: string;

  @IsNotEmpty({ message: "L'email de l'administrateur principal est requis." }) 
  @IsEmail({}, { message: "Format d'email invalide pour l'Admin 1." })
  admin1Email!: string;

  @IsNotEmpty({ message: "L'email du second administrateur est requis." }) 
  @IsEmail({}, { message: "Format d'email invalide pour l'Admin 2." })
  admin2Email!: string;

  @IsOptional()
  @IsString()
  defaultPassword?: string;
}