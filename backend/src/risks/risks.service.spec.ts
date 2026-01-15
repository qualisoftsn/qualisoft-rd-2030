import { Test, TestingModule } from '@nestjs/testing';
import { RisksService } from './risks.service';

describe('RisksService', () => {
  let service: RisksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RisksService],
    }).compile();

    service = module.get<RisksService>(RisksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
