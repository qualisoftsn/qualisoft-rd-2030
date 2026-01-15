import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  label!: string;

  @IsOptional()
  @IsHexColor()
  color?: string; // Pour les types de processus
}