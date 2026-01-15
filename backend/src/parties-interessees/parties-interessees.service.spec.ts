import { Test, TestingModule } from '@nestjs/testing';
import { PartiesInteresseesService } from './parties-interessees.service';

describe('PartiesInteresseesService', () => {
  let service: PartiesInteresseesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartiesInteresseesService],
    }).compile();

    service = module.get<PartiesInteresseesService>(PartiesInteresseesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
