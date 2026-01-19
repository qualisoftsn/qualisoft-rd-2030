import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class EvaluateCompetenceDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  competenceId!: string;

  @IsInt()
  @Min(1) // 1: Débutant
  @Max(4) // 4: Expert / Formateur
  level!: number;
}