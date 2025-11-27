import { Module } from '@nestjs/common';
import { SmartbillService } from './smartbill.service';
import { SmartbillController } from './smartbill.controller';
import { TrendyolService } from 'src/trendyol/trendyol.service';

@Module({
  controllers: [SmartbillController],
  providers: [SmartbillService, TrendyolService],
  
})
export class SmartbillModule {}
