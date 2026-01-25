import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom du site est obligatoire" })
  S_Name!: string;

  @IsOptional()
  @IsString()
  S_Address?: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;
}