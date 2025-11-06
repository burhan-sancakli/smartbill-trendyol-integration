import { Test, TestingModule } from '@nestjs/testing';
import { SmartbillService } from './smartbill.service';

describe('SmartbillService', () => {
  let service: SmartbillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartbillService],
    }).compile();

    service = module.get<SmartbillService>(SmartbillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
