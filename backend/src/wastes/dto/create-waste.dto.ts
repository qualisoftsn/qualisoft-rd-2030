import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateWasteDto {
  @IsString()
  WAS_Label: string;

  @IsNumber()
  @Min(0)
  WAS_Weight: number;

  @IsString()
  WAS_Type: string;

  @IsString()
  WAS_Treatment: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  WAS_Month: number;

  @IsNumber()
  @Min(2000)
  @Max(2100)
  WAS_Year: number;

  @IsString()
  WAS_SiteId: string;
}