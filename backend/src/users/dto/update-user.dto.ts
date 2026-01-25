import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  U_IsActive?: boolean;

  @IsOptional()
  @IsString()
  U_Password?: string; // Pour le changement de mot de passe
}