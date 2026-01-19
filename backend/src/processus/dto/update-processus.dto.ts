import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessusDto } from './create-processus.dto';

export class UpdateProcessusDto extends PartialType(CreateProcessusDto) {}