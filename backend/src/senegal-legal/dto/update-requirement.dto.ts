import { PartialType } from '@nestjs/mapped-types';
import { CreateRequirementDto } from './create-legal-requirement.dto';

/**
 * DTO pour la mise à jour partielle d'une exigence légale.
 * Hérite de toutes les validations de CreateRequirementDto mais rend les champs optionnels.
 */
export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {}