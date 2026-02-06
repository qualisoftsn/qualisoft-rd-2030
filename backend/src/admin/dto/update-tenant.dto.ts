import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Plan, SubscriptionStatus } from '@prisma/client';

export class UpdateTenantDto {
  @IsOptional() @IsString() T_Name?: string;
  @IsOptional() @IsEnum(Plan) T_Plan?: Plan;
  @IsOptional() @IsEnum(SubscriptionStatus) T_SubscriptionStatus?: SubscriptionStatus;
  @IsOptional() @IsDateString() T_ExpiryDate?: string;
  @IsOptional() @IsBoolean() T_IsActive?: boolean;
}