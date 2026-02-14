import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  T_Name!: string; // 👈 Le ! est la clé qui calme TypeScript

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
  T_Domain?: string; // Optionnel car généré automatiquement si absent

  @IsOptional()
  @IsString()
  T_SubscriptionStatus?: string; 

  @IsOptional()
  @IsString()
  T_Plan?: string;

  @IsOptional()
  T_ContractDuration?: number;
}