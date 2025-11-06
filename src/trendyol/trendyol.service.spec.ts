import { Test, TestingModule } from '@nestjs/testing';
import { TrendyolService } from './trendyol.service';

describe('TrendyolService', () => {
  let service: TrendyolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrendyolService],
    }).compile();

    service = module.get<TrendyolService>(TrendyolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
