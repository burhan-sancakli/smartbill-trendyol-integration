import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';

@Controller('trendyol')
export class TrendyolController {
  constructor(private readonly trendyolService: TrendyolService) {}

  @Get('submit-generated-order-to-trendyol/:smartbillOrderNumber')
  submitGeneratedOrderToTrendyol(@Param('smartbillOrderNumber') id: number) {
    return this.trendyolService.submitGeneratedOrderToTrendyol(id);
  }

  @Get('order/smartbill')
  getOrdersForSmartbill() {
    return this.trendyolService.getOrdersForSmartbill();
  }

  @Post('order/smartbill')
  generateOrdersForSmartbill() {
    return this.trendyolService.generateOrdersForSmartbill();
  }

  @Get('order/:id/smartbill')
  getOrderForSmartbill(@Param('id') id: string) {
    return this.trendyolService.getOrderForSmartbill(id);
  }

  @Post('order/:id/smartbill')
  generateOrderForSmartbill(@Param('id') id: string) {
    return this.trendyolService.generateOrderForSmartbill(id, true);
  }

  @Get('order/:id')
  getOrder(@Param('id') id: string) {
    return this.trendyolService.getOrder(id);
  }

  @Get('order')
  getOrders() {
    return this.trendyolService.getOrders();
  }
}
