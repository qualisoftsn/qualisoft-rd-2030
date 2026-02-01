import { PartialType } from '@nestjs/swagger';
import { CreateCauserieDto } from './create-causerie.dto';

export class UpdateCauserieDto extends PartialType(CreateCauserieDto) {}