import { Test, TestingModule } from '@nestjs/testing';
import { ProcessusController } from './processus.controller';

describe('ProcessusController', () => {
  let controller: ProcessusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessusController],
    }).compile();

    controller = module.get<ProcessusController>(ProcessusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
