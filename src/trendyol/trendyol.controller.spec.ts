import { Test, TestingModule } from '@nestjs/testing';
import { TrendyolController } from './trendyol.controller';
import { TrendyolService } from './trendyol.service';

describe('TrendyolController', () => {
  let controller: TrendyolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrendyolController],
      providers: [TrendyolService],
    }).compile();

    controller = module.get<TrendyolController>(TrendyolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
