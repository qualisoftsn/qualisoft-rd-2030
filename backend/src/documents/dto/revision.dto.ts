import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRevisionDto {
  @IsString()
  @IsNotEmpty()
  changeDescription: string = '';

  @IsString()
  @IsOptional()
  previousVersionId?: string;
}