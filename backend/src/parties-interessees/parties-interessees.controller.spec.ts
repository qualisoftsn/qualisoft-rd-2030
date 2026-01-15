import { Test, TestingModule } from '@nestjs/testing';
import { PartiesInteresseesController } from './parties-interessees.controller';

describe('PartiesInteresseesController', () => {
  let controller: PartiesInteresseesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesInteresseesController],
    }).compile();

    controller = module.get<PartiesInteresseesController>(PartiesInteresseesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
