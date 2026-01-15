import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateProcessusDto {
  @IsString()
  PR_Code!: string;

  @IsString()
  PR_Libelle!: string;

  @IsOptional()
  @IsString()
  PR_Description?: string;

  @IsUUID()
  PR_TypeId!: string; // 👈 UUID vers la table ProcessType

  @IsUUID()
  PR_PiloteId!: string;

  @IsOptional()
  @IsUUID()
  PR_CoPiloteId?: string;
}