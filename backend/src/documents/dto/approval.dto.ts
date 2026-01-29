import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class ApprovalDto {
  @IsBoolean()
  approved: boolean = false;

  @IsString()
  @IsOptional()
  comment?: string;
}