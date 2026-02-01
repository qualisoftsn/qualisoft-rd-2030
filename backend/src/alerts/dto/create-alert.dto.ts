import { IsString, IsOptional, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlertDto {
  @IsString()
  AL_Title!: string;

  @IsString()
  AL_Message!: string;

  @IsEnum(['DEADLINE', 'OVERDUE', 'REMINDER', 'COMPLIANCE', 'LEGAL_UPDATE'])
  AL_Type!: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT'])
  AL_Priority!: string;

  @IsDate()
  @Type(() => Date)
  AL_DueDate!: Date;

  @IsOptional()
  @IsString()
  AL_RequirementId?: string;

  @IsOptional()
  @IsString()
  AL_AuditId?: string;

  @IsOptional()
  @IsString()
  AL_ActionId?: string;

  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;
}