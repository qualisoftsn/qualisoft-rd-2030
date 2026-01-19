import { IsString, IsUUID, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateProcessusDto {
  @IsString()
  @MaxLength(10)
  @Matches(/^[A-Z0-9-]+$/, { message: 'Le code doit être en majuscules (ex: PR-RH-01)' })
  PR_Code!: string;

  @IsString()
  @MaxLength(255)
  PR_Libelle!: string;

  @IsOptional()
  @IsString()
  PR_Description?: string;

  @IsUUID()
  PR_TypeId!: string; // 👈 Relation obligatoire vers ProcessType

  @IsUUID()
  PR_PiloteId!: string; // 👈 Responsable principal (ISO 9001)

  @IsOptional()
  @IsUUID()
  PR_CoPiloteId?: string;
}