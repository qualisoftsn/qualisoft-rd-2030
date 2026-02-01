import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvironmentIncidentDto } from './create-environment-incident.dto';

export class UpdateEnvironmentIncidentDto extends PartialType(CreateEnvironmentIncidentDto) {}