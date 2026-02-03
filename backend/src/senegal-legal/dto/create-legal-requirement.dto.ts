import { IsString, IsNotEmpty, IsOptional, IsISO8601 } from 'class-validator';

/**
 * Data Transfer Object pour la création d'une exigence légale
 * Assure la conformité des données entrantes avec le schéma Prisma
 */
export class CreateRequirementDto {
  @IsString()
  @IsNotEmpty()
  SLR_Category!: string;

  @IsString()
  @IsNotEmpty()
  SLR_Title!: string;

  @IsString()
  @IsOptional()
  SLR_Description?: string;

  @IsString()
  @IsNotEmpty()
  SLR_Reference!: string;

  @IsString()
  @IsNotEmpty()
  SLR_Authority!: string;

  @IsISO8601()
  @IsOptional()
  SLR_Deadline?: string;

  @IsString()
  @IsOptional()
  SLR_Evidence?: string;

  @IsString()
  @IsOptional()
  SLR_Comment?: string;
}