import { Test, TestingModule } from '@nestjs/testing';
import { ProcessusService } from './processus.service';

describe('ProcessusService', () => {
  let service: ProcessusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessusService],
    }).compile();

    service = module.get<ProcessusService>(ProcessusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
