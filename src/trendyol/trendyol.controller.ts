import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';

@Controller('trendyol')
export class TrendyolController {
  constructor(private readonly trendyolService: TrendyolService) {}

  @Get('store-id/:storeId/store-front-code/:storeFrontCode/submit-generated-order-to-trendyol/:smartbillOrderNumber')
  submitGeneratedOrderToTrendyol(
    @Param('storeId') storeId: number,
    @Param('storeFrontCode') storeFrontCode: string,
    @Param('smartbillOrderNumber') smartbillOrderNumber: number) {
    return this.trendyolService.submitGeneratedOrderToTrendyol(storeId, storeFrontCode, smartbillOrderNumber);
  }

  @Get('order/smartbill')
  getOrdersForSmartbill() {
    return this.trendyolService.getOrdersForSmartbill();
  }

  @Post('order/smartbill')
  generateOrdersForSmartbill() {
    return this.trendyolService.generateOrdersForSmartbill(true);
  }

  @Get('store-id/:storeId/store-front-code/:storeFrontCode/order-number/:orderNumber/smartbill')
  getOrderForSmartbill(
    @Param('storeId') storeId: number,
    @Param('orderNumber') orderNumber: string,
    @Param('storeFrontCode') storeFrontCode: string) {
    return this.trendyolService.getOrderForSmartbill(storeId, orderNumber, storeFrontCode);
  }

  @Post('store-id/:storeId/store-front-code/:storeFrontCode/order-number/:orderNumber/smartbill')
  generateOrderForSmartbill(
    @Param('storeId') storeId: number,
    @Param('storeFrontCode') storeFrontCode: string,
    @Param('orderNumber') orderNumber: string) {
    return this.trendyolService.generateOrderForSmartbill(storeId, orderNumber, storeFrontCode, true);
  }

  @Get('store-id/:storeId/store-front-code/:storeFrontCode/order-number/:orderNumber')
  getOrder(
    @Param('storeId') storeId: number, 
    @Param('orderNumber') orderNumber: string,
    @Param('storeFrontCode') storeFrontCode: string) {
    return this.trendyolService.getOrder(storeId, orderNumber, storeFrontCode);
  }

  @Get('order')
  getOrders() {
    return this.trendyolService.getOrders();
  }
}
