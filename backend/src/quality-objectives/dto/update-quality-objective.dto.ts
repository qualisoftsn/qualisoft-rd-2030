import { PartialType } from '@nestjs/mapped-types';
import { CreateQualityObjectiveDto } from './create-quality-objective.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ObjectiveStatus } from '@prisma/client';

export class UpdateQualityObjectiveDto extends PartialType(CreateQualityObjectiveDto) {
  @IsEnum(ObjectiveStatus)
  @IsOptional()
  QO_Status?: ObjectiveStatus;
}