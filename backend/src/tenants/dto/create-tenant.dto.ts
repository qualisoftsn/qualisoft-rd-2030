import { IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Plan, SubscriptionStatus } from '@prisma/client';

export class CreateTenantDto {
  @IsString() @IsNotEmpty()
  T_Name!: string;

  @IsEmail()
  T_Email!: string;

  @IsString() @IsNotEmpty()
  T_Domain!: string;

  @IsOptional() @IsString()
  T_Address?: string;

  @IsOptional() @IsString()
  T_Phone?: string;

  @IsOptional() @IsInt()
  T_ContractDuration?: number;
}