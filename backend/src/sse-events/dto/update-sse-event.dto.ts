import { PartialType } from '@nestjs/mapped-types';
import { CreateSSEEventDto } from './create-sse-event.dto';

export class UpdateSSEEventDto extends PartialType(CreateSSEEventDto) {}