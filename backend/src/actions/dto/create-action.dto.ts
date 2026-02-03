import { IsString, IsEnum, IsOptional, IsUUID, IsISO8601, MinLength } from 'class-validator';
import { ActionStatus, ActionOrigin, ActionType, Priority } from '@prisma/client';

export class CreateActionDto {
  @IsString() @MinLength(5) ACT_Title!: string;
  @IsString() @IsOptional() ACT_Description?: string;
  @IsEnum(ActionOrigin) @IsOptional() ACT_Origin?: ActionOrigin;
  @IsEnum(ActionType) @IsOptional() ACT_Type?: ActionType;
  @IsEnum(ActionStatus) @IsOptional() ACT_Status?: ActionStatus;
  @IsEnum(Priority) @IsOptional() ACT_Priority?: Priority;
  @IsISO8601() ACT_Deadline!: string;
  @IsUUID() ACT_ResponsableId!: string;
  @IsUUID() PAQ_ProcessusId!: string;
  @IsUUID() @IsOptional() ACT_NCId?: string;
  @IsUUID() @IsOptional() ACT_ReclamationId?: string;
  @IsUUID() @IsOptional() ACT_AuditId?: string;
  @IsUUID() @IsOptional() ACT_MeetingId?: string;
  @IsUUID() @IsOptional() ACT_SSEEventId?: string;
  @IsUUID() @IsOptional() ACT_RiskId?: string;
}