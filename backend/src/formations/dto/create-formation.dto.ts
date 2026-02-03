import { IsString, IsNotEmpty, IsISO8601, IsUUID, IsOptional, MinLength } from 'class-validator';

export class CreateFormationDto {
  @IsString() @IsNotEmpty() @MinLength(3)
  FOR_Title!: string;

  @IsISO8601()
  FOR_Date!: string;

  @IsISO8601() @IsOptional()
  FOR_Expiry?: string;

  @IsString() @IsNotEmpty()
  FOR_Provider!: string;

  @IsUUID()
  FOR_UserId!: string;

  @IsString() @IsOptional()
  FOR_Status?: string;
}