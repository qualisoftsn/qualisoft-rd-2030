import { Module } from '@nestjs/common';
import { OrgUnitTypesService } from './org-unit-types.service';
import { OrgUnitTypesController } from './org-unit-types.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GenericCrudModule } from '../common/generic-crud.module'; // Assure-toi que ce module existe

@Module({
  imports: [PrismaModule, GenericCrudModule],
  controllers: [OrgUnitTypesController],
  providers: [OrgUnitTypesService],
  exports: [OrgUnitTypesService],
})
export class OrgUnitTypesModule {}