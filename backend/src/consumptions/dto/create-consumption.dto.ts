import { IsString, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export class CreateConsumptionDto {
  @IsString()
  CON_Type: string | undefined;

  @IsNumber()
  @Min(0)
  CON_Value: number | undefined;

  @IsString()
  CON_Unit: string | undefined;

  @IsNumber()
  @Min(1)
  @Max(12)
  CON_Month: number | undefined;

  @IsNumber()
  @Min(2000)
  @Max(2100)
  CON_Year: number | undefined;

  @IsOptional()
  @IsNumber()
  @Min(0)
  CON_Cost?: number;

  @IsString()
  CON_SiteId: string | undefined;
}