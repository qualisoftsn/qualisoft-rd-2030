import { Test, TestingModule } from '@nestjs/testing';
import { ActionsController } from './actions.controller';
import { beforeEach, describe, it } from 'node:test';

describe('ActionsController', () => {
  let controller: ActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionsController],
    }).compile();

    controller = module.get<ActionsController>(ActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
