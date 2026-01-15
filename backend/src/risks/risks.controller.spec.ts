import { Test, TestingModule } from '@nestjs/testing';
import { RisksController } from './risks.controller';

describe('RisksController', () => {
  let controller: RisksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RisksController],
    }).compile();

    controller = module.get<RisksController>(RisksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
