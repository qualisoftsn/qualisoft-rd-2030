import { Test, TestingModule } from '@nestjs/testing';
import { PaqController } from './paq.controller';

describe('PaqController', () => {
  let controller: PaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaqController],
    }).compile();

    controller = module.get<PaqController>(PaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
