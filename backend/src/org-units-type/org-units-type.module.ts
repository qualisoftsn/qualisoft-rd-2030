import { Module } from '@nestjs/common';
import { OrgUnitsTypeController } from './org-units-type.controller';
import { OrgUnitsTypeService } from './org-units-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrgUnitsTypeController],
  providers: [OrgUnitsTypeService],
  exports: [OrgUnitsTypeService],
})
export class OrgUnitsTypeModule {}