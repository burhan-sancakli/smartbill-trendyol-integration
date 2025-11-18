import { Injectable } from '@nestjs/common';
import { TrendyolOrderDto } from './dto/trendyol-order.dto';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { TrendyolOrderResponseDto } from './dto/trendyol-order-response.dto';
import { DateTime } from 'luxon';
import { RequestSmartbillInvoiceDto } from 'src/smartbill/dto/request-smartbill-invoice.dto';
import { TrendyolSmartbillInvoiceAdapter } from './adapters/trendyol-smartbill-invoice.adapter';
import { SmartbillService } from 'src/smartbill/smartbill.service';
import FormData from 'form-data';

@Injectable()
export class TrendyolService {
  private readonly config: ConfigService;
  private readonly client: AxiosInstance;
  private readonly smartbill: SmartbillService;
  constructor(config: ConfigService, smartbill: SmartbillService) {
    this.config = config; 
    this.client = axios.create({
      baseURL: this.config.get<string>('TRENDYOL_BASE_URL'),
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
    const excludedOrderNumbers: string[] = []
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

  _getOrderForSmartbill(trendyolOrder: TrendyolOrderDto){
    const smartbillOrder = TrendyolSmartbillInvoiceAdapter.toInternal(trendyolOrder);
    return smartbillOrder;
  }

  async getOrdersForSmartbill(): Promise<RequestSmartbillInvoiceDto[]> {
    const trendyolOrders = await this.getOrders();
    const smartbillOrders = trendyolOrders.map((trendyolOrder)=> this._getOrderForSmartbill(trendyolOrder));
    return smartbillOrders;
  }

  async getOrderForSmartbill(id: string): Promise<RequestSmartbillInvoiceDto | undefined> {
    const trendyolOrder = await this.getOrder(id);
    if(!trendyolOrder){
      return undefined;
    }
    const smartbillOrder = this._getOrderForSmartbill(trendyolOrder);
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

  async generateOrderForSmartbill(id: string, submitToTrendyol: boolean = false): Promise<RequestSmartbillInvoiceDto> {
    const trendyolOrder = await this.getOrder(id);
    if(!trendyolOrder){
      throw `Trendyol order not found for orderNumber: ${id}`;
    }
    const smartbillOrderFormat = this._getOrderForSmartbill(trendyolOrder);
    if(!smartbillOrderFormat){
      throw `smartbillOrderFormat couldn't be created for orderNumber: ${id}`;
    }
    const smartbillOrder = await this.smartbill.createInvoice(smartbillOrderFormat);
    if(!smartbillOrder){
      throw `smartbillOrder couldn't be created for orderNumber: ${id}`;
    }
    if(submitToTrendyol){
      const result = await this._submitGeneratedOrderToTrendyol(trendyolOrder.id, smartbillOrder)
      if(!result){
        throw `smartbillOrder for orderNumber ${id} has been created, but that couldn't be submitted to Trendyol. From now on, manual submission of this invoice to the Trendyol is required!`;
      }
    }
    return smartbillOrderFormat;
  }
  
  async _submitGeneratedOrderToTrendyol(orderId: number, bufferText: Buffer<ArrayBufferLike>){
    const clientId = this.config.get<number>('TRENDYOL_API_ID') || 0;
    const apiKey = this.config.get<string>('TRENDYOL_API_KEY') || "";
    const apiSecret = this.config.get<string>('TRENDYOL_API_SECRET') || "";
    const url = `/sellers/${clientId}/seller-invoice-file`;
    // Multipart Body
    const form = new FormData();
    form.append('shipmentPackageId', orderId.toString());
    form.append('file', bufferText, {
      filename: `${orderId}.pdf`,
      contentType: 'application/pdf'
    });

    const response = await this.client.post(url, form, this.getHttpConfig(apiKey, apiSecret));
    const success = response.status === 201;
    if(!success){
      console.log(`_submitGeneratedOrderToTrendyol(${orderId}, ...); Response status is not 201, it is ${response.status}. Response body is: ${response.data}`);
    }
    return success;
  }

  async submitGeneratedOrderToTrendyol(smartbillOrderNumber: number){
    const smartbillOrder = await this.smartbill.getInvoice(smartbillOrderNumber);
    const avizNumber = await this.smartbill.getAvizNumberFromInvoice(smartbillOrder);
    if(!avizNumber){
      throw `aviz number not found for invoice with the index: ${smartbillOrderNumber}`;
    }
    const trendyolOrder = await this.getOrder(avizNumber);
    if (!trendyolOrder){
      throw `Trendyol order not found for aviz number: ${avizNumber}`;
    }
    if(!["Delivered"].includes(trendyolOrder.status)){
      throw `Trendyol order has not been delivered yet Aviz number: ${avizNumber}, Status: ${trendyolOrder.status}`;
    }
    const orderId = trendyolOrder.id;
    // Multipart Body
    const response = await this._submitGeneratedOrderToTrendyol(orderId, smartbillOrder);
    return response;
  }
  
  async submitGeneratedOrdersToTrendyol(){
    for(var i=1; i<102; i++){
      await this.submitGeneratedOrderToTrendyol(i);
    }
  }
}
