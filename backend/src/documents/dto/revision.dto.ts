import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRevisionDto {
  @IsString()
  @IsNotEmpty({ message: "La description des modifications est obligatoire pour la traçabilité." })
  changeDescription: string = '';

  @IsUUID()
  @IsOptional()
  previousVersionId?: string;
}