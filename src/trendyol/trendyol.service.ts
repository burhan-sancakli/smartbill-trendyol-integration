import { Injectable } from '@nestjs/common';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { TrendyolOrderResponseDto } from './dto/trendyol-order-response.dto';

@Injectable()
export class TrendyolService {
  private readonly config: ConfigService;
  private readonly client: AxiosInstance;
  constructor(config: ConfigService) {
    this.config = config; 
    this.client = axios.create({
      baseURL: this.config.get<string>('TRENDYOL_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
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
    const startDate = "1757203200000";
    const endDate = "1755993600000";
    const url = `/order/sellers/${clientId}/orders?size=200&page=0&endDate=${startDate}&startDate=${endDate}`;
    const response = await this.client.get(url, this.getHttpConfig(apiKey, apiSecret));
    const responseJson: TrendyolOrderResponseDto = response.data;
    const data = responseJson.content;
    return data;
  }

 async getOrder(id: number): Promise<TrendyolOrderDto | undefined> {
    const clientId = this.config.get<number>('TRENDYOL_API_ID') || 0;
    const apiKey = this.config.get<string>('TRENDYOL_API_KEY') || "";
    const apiSecret = this.config.get<string>('TRENDYOL_API_SECRET') || "";
    const url = `/order/sellers/${clientId}/orders?orderNumber=${id}`;
    const response = await this.client.get(url, this.getHttpConfig(apiKey, apiSecret));
    const responseJson: TrendyolOrderResponseDto = response.data;
    const data = responseJson.content.at(0)
    return data;
  }
}
