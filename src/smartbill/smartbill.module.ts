import { Module } from '@nestjs/common';
import { SmartbillService } from './smartbill.service';
import { SmartbillController } from './smartbill.controller';

@Module({
  controllers: [SmartbillController],
  providers: [SmartbillService],
})
export class SmartbillModule {}
