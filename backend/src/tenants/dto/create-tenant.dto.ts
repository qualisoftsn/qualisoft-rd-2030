import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  T_Name!: string;

  @IsEmail()
  @IsNotEmpty()
  T_Email!: string;

  @IsString()
  @IsNotEmpty()
  T_CeoName!: string;

  @IsString()
  @IsNotEmpty()
  T_Address!: string;

  @IsString()
  @IsNotEmpty()
  T_Phone!: string;

  @IsOptional()
  @IsString()
  T_Domain?: string; // Si vide, le service générera le slug automatiquement

  @IsOptional()
  @IsString()
  T_SubscriptionStatus?: string; 

  @IsOptional()
  @IsString()
  T_Plan?: string;

  @IsOptional()
  @IsInt() // Changement : On force un entier pour la durée
  T_ContractDuration?: number;

  @IsOptional()
  @IsBoolean()
  T_TacitRenewal?: boolean;
}