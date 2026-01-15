import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class OnboardingDto {
  @IsEmail()
  email!: string; // Le '!' règle l'erreur TS2564 (initialisation)

  @IsString()
  firstName!: string;

  @IsString()
  companyName!: string;

  @IsEnum(['LOGISTICS', 'HEALTH', 'CONSTRUCTION', 'MINING', 'SERVICES'])
  @IsOptional()
  sector?: string;

  @IsString()
  @IsOptional()
  primaryGoal?: string;
}