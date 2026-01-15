import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgUnitDto } from './create-org-unit.dto';

// Cette ligne dit : "C'est comme la création, mais tous les champs sont optionnels"
export class UpdateOrgUnitDto extends PartialType(CreateOrgUnitDto) {}