import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class OnboardingDto {
  @IsEmail()
  email!: string; // Le '!' règle l'erreur TS2564 (initialisation)

  @IsString()
  firstName!: string;

  @IsString()
  companyName!: string;

  @IsEnum(['LOGISTICS', 'HEALTH', 'CONSTRUCTION', 'MINING', 'SERVICES', 'AGRICULTURE', 'AUTRE'], { message: 'Le secteur doit être l\'un des suivants : LOGISTICS, HEALTH, CONSTRUCTION, MINING, SERVICES, AGRICULTURE, OTHER' })
  @IsOptional()
  sector?: string;

  @IsString()
  @IsOptional()
  primaryGoal?: string;
}