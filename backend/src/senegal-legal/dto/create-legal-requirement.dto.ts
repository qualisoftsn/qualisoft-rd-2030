import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDate, 
  IsBoolean,
  IsArray,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLegalRequirementDto {
  @IsString()
  SLR_Category!: string;

  @IsString()
  SLR_Title!: string;

  @IsString()
  SLR_Description!: string;

  @IsString()
  SLR_Reference!: string;

  @IsString()
  SLR_Authority!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  SLR_Deadline?: Date;

  @IsOptional()
  @IsString()
  SLR_Status?: string;

  @IsOptional()
  @IsString()
  SLR_Evidence?: string;

  @IsOptional()
  @IsString()
  SLR_Comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  actions?: { 
    ACT_Title: string; 
    ACT_Type: string; 
    ACT_ResponsableId: string;
    ACT_Deadline?: Date;
  }[];
}