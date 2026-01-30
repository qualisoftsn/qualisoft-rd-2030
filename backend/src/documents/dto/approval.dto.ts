import { IsBoolean, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ApprovalDto {
  @IsBoolean({ message: "Le statut d'approbation doit être un booléen." })
  @IsNotEmpty()
  approved: boolean = false;

  @IsString({ message: "Le commentaire doit être une chaîne de caractères." })
  @IsOptional()
  comment?: string;
}