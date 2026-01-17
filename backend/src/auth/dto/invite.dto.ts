import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteDto {
  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  message?: string;
}
