import { Injectable } from '@nestjs/common';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { TrendyolOrderResponseDto } from './dto/trendyol-order-response.dto';
import { DateTime } from 'luxon';
import { RequestSmartbillInvoiceDto } from 'src/smartbill/dto/request-smartbill-invoice.dto';
import { TrendyolSmartbillInvoiceAdapter } from './adapters/trendyol-smartbill-invoice.adapter';
import { SmartbillService } from 'src/smartbill/smartbill.service';

@Injectable()
export class TrendyolService {
  private readonly config: ConfigService;
  private readonly client: AxiosInstance;
  private readonly smartbill: SmartbillService;
  constructor(config: ConfigService, smartbill: SmartbillService) {
    this.config = config; 
    this.client = axios.create({
      baseURL: this.config.get<string>('TRENDYOL_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    this.smartbill = smartbill;
  }


  private getHttpConfig(apiKey: string, apiSecret: string){
    return { 
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
        StoreFrontCode: this.config.get<number>('TRENDYOL_API_STORE_FRONT_CODE')
      }
    };
  }

  async getOrders(): Promise<TrendyolOrderDto[]> {
    const clientId = this.config.get<number>('TRENDYOL_API_ID') || 0;
    const apiKey = this.config.get<string>('TRENDYOL_API_KEY') || "";
    const apiSecret = this.config.get<string>('TRENDYOL_API_SECRET') || "";
    // Aktuelle Zeit in Europa/Bucharest
    const now = DateTime.now().setZone('Europe/Bucharest');
    // Fünf Tage früher, Mitternacht (erste Minute des Tages)
    const fiveDaysAgo = now.minus({ days: 5 }).startOf('day');

    const endDate = now.toMillis();         // aktuelle Zeit in ms
    const startDate = fiveDaysAgo.toMillis(); // 00:00 vor 5 Tagen
    const url = `/order/sellers/${clientId}/orders?size=200&page=0&startDate=${startDate}&endDate=${endDate}`;
    const response = await this.client.get(url, this.getHttpConfig(apiKey, apiSecret));
    const responseJson: TrendyolOrderResponseDto = response.data;
    const excludedOrderNumbers = ["10659296402","10659256077"]
    const data = responseJson.content.filter((item)=>!excludedOrderNumbers.includes(item.orderNumber));
    return data;
  }

  async getOrder(id: string): Promise<TrendyolOrderDto | undefined> {
    const clientId = this.config.get<number>('TRENDYOL_API_ID') || 0;
    const apiKey = this.config.get<string>('TRENDYOL_API_KEY') || "";
    const apiSecret = this.config.get<string>('TRENDYOL_API_SECRET') || "";
    const url = `/order/sellers/${clientId}/orders?orderNumber=${id}`;
    const response = await this.client.get(url, this.getHttpConfig(apiKey, apiSecret));
    const responseJson: TrendyolOrderResponseDto = response.data;
    const data = responseJson.content.at(0)
    return data;
  }

  async getOrdersForSmartbill(): Promise<RequestSmartbillInvoiceDto[]> {
    const trendyolOrders = await this.getOrders();
    const smartbillOrders = trendyolOrders.map((trendyolOrder)=>TrendyolSmartbillInvoiceAdapter.toInternal(trendyolOrder));
    return smartbillOrders;
  }

  async getOrderForSmartbill(id: string): Promise<RequestSmartbillInvoiceDto | undefined> {
    const trendyolOrder = await this.getOrder(id);
    if(!trendyolOrder){
      return undefined;
    }
    const smartbillOrder = TrendyolSmartbillInvoiceAdapter.toInternal(trendyolOrder);
    return smartbillOrder;
  }

  async generateOrdersForSmartbill(): Promise<RequestSmartbillInvoiceDto[]> {
    const smartbillOrders = await this.getOrdersForSmartbill();
    for(var key in smartbillOrders){
      const smartbillOrder = smartbillOrders[key];
      const result = await this.smartbill.createInvoice(smartbillOrder);
    }
    return smartbillOrders;
  }

  async generateOrderForSmartbill(id: string): Promise<RequestSmartbillInvoiceDto | undefined> {
    const smartbillOrder = await this.getOrderForSmartbill(id);
    if(!smartbillOrder){
      return undefined;
    }
    const result = await this.smartbill.createInvoice(smartbillOrder);
    return smartbillOrder;
  }
}
