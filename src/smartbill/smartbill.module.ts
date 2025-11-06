import { Module } from '@nestjs/common';
import { SmartbillController } from './smartbill.controller';

@Module({
  controllers: [SmartbillController]
})
export class SmartbillModule {}
