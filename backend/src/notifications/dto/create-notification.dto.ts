import { IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty({ message: "Le titre est requis" })
  N_Title!: string; // ✅ Ajout de ! pour l'initialisation certaine

  @IsString()
  @IsNotEmpty({ message: "Le message ne peut pas être vide" })
  N_Message!: string;

  @IsEnum(NotificationType)
  N_Type!: NotificationType;

  @IsUUID()
  userId!: string;

  @IsUUID()
  tenantId!: string;
}