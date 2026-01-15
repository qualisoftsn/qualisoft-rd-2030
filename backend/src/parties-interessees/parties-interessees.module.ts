import { Module } from '@nestjs/common';
import { PartiesInteresseesService } from './parties-interessees.service';
import { PartiesInteresseesController } from './parties-interessees.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartiesInteresseesController],
  providers: [PartiesInteresseesService],
})
export class PartiesInteresseesModule {}