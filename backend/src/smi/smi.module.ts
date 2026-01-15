import { Module } from '@nestjs/common';
import { SmiController } from './smi.controller';
// ... autres imports

@Module({
  controllers: [SmiController],
  // ... rest of the module
})
export class SmiModule {}