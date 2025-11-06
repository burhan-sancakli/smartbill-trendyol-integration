import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';

@Controller('trendyol')
export class TrendyolController {
  constructor(private readonly trendyolService: TrendyolService) {}
  
  @Get('order')
  getOrders() {
    return this.trendyolService.getOrders();
  }

  @Get('order/:id')
  getOrder(@Param('id') id: string) {
    return this.trendyolService.getOrder(+id);
  }
}
