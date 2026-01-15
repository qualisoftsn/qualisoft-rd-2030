import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // ✅ On ajoute le champ IsActive pour permettre de désactiver un compte (Soft Delete)
  @IsOptional()
  @IsBoolean()
  U_IsActive?: boolean;
}