import { PartialType } from '@nestjs/mapped-types';
import { CreateSseEventDto } from './create-sse-event.dto';

export class UpdateSseEventDto extends PartialType(CreateSseEventDto) {}