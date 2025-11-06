import { Test, TestingModule } from '@nestjs/testing';
import { SmartbillController } from './smartbill.controller';

describe('SmartbillController', () => {
  let controller: SmartbillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartbillController],
    }).compile();

    controller = module.get<SmartbillController>(SmartbillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
