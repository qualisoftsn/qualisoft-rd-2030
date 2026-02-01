import { PartialType } from '@nestjs/swagger';
import { CreateWasteDto } from './create-waste.dto';

/**
 * UpdateWasteDto hérite de toutes les propriétés de CreateWasteDto
 * mais les rend optionnelles pour permettre des mises à jour partielles.
 */
export class UpdateWasteDto extends PartialType(CreateWasteDto) {}