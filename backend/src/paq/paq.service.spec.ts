import { Test, TestingModule } from '@nestjs/testing';
import { PaqService } from './paq.service';

describe('PaqService', () => {
  let service: PaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaqService],
    }).compile();

    service = module.get<PaqService>(PaqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
