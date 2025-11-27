import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';

@Controller('trendyol')
export class TrendyolController {
  constructor(private readonly trendyolService: TrendyolService) {}

  @Get('store-id/:storeId/submit-generated-order-to-trendyol/:smartbillOrderNumber')
  submitGeneratedOrderToTrendyol(
    @Param('storeId') storeId: number, 
    @Param('smartbillOrderNumber') smartbillOrderNumber: number) {
    return this.trendyolService.submitGeneratedOrderToTrendyol(storeId,smartbillOrderNumber);
  }

  @Get('order/smartbill')
  getOrdersForSmartbill() {
    return this.trendyolService.getOrdersForSmartbill();
  }

  @Post('order/smartbill')
  generateOrdersForSmartbill() {
    return this.trendyolService.generateOrdersForSmartbill();
  }

  @Get('store-id/:storeId/order-number/:orderNumber/smartbill')
  getOrderForSmartbill(
    @Param('storeId') storeId: number,
    @Param('orderNumber') orderNumber: string) {
    return this.trendyolService.getOrderForSmartbill(storeId, orderNumber);
  }

  @Post('store-id/:storeId/order-number/:orderNumber/smartbill')
  generateOrderForSmartbill(
    @Param('storeId') storeId: number,
    @Param('orderNumber') orderNumber: string) {
    return this.trendyolService.generateOrderForSmartbill(storeId, orderNumber, true);
  }

  @Get('store-id/:storeId/order-number/:orderNumber')
  getOrder(
    @Param('storeId') storeId: number, 
    @Param('orderNumber') orderNumber: string) {
    return this.trendyolService.getOrder(storeId, orderNumber);
  }

  @Get('order')
  getOrders() {
    return this.trendyolService.getOrders();
  }
}
