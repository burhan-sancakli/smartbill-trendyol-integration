import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
  private readonly client: AxiosInstance;
  private readonly storeIds: number[];
  constructor(private readonly config: ConfigService, @Inject(forwardRef(() => SmartbillService)) private readonly smartbill: SmartbillService) {
    this.config = config; 
    this.client = axios.create({
      baseURL: this.config.get<string>('TRENDYOL_BASE_URL'),
      timeout: 5000,
    });
    this.storeIds = this.getStoreIds();
  }

  public getStoreIds() {
    const storeIds = this.config.get<string>('TRENDYOL_STORE_IDS')?.split(',').map(item=>parseInt(item)) || [];
    return storeIds;
  }

  public getStoreIdFromSeriesName(seriesName: string): number {
    const storeIds = this.getStoreIds();
    const storeId = storeIds.find(id => this.config.get<string>(`TRENDYOL_${id}_SMARTBILL_SERIES_NAME`) == seriesName);
    if(!storeId){
      throw `Store ID not found for series name: ${seriesName}`;
    }
    return storeId;
  }

  private getHttpConfig(storeId: number){
    const apiStoreFrontCode = this.config.get<number>(`TRENDYOL_${storeId}_API_STORE_FRONT_CODE`);
    const apiKey = this.config.get<string>(`TRENDYOL_${storeId}_API_KEY`) || "";
    const apiSecret = this.config.get<string>(`TRENDYOL_${storeId}_API_SECRET`) || "";
    return { 
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
        StoreFrontCode: apiStoreFrontCode || ''
      }
    };
  }

  async getOrders(): Promise<TrendyolOrderDto[]> {
    // Aktuelle Zeit in Europa/Bucharest
    const now = DateTime.now().setZone('Europe/Bucharest');
    // Fünf Tage früher, Mitternacht (erste Minute des Tages)
    const fiveDaysAgo = now.minus({ days: 5 }).startOf('day');

    const endDate = now.toMillis();         // aktuelle Zeit in ms
    const startDate = fiveDaysAgo.toMillis(); // 00:00 vor 5 Tagen
    const ordersDict: {[storeId_orderNumber: string]: TrendyolOrderDto} = {};
    for (const storeId of this.storeIds) {
      for (let page = 0; page < 999999; page++) {
        const url = `/order/sellers/${storeId}/orders?size=200&page=${page}&startDate=${startDate}&endDate=${endDate}`;
        const response = await this.client.get(url, this.getHttpConfig(storeId));
        const responseJson: TrendyolOrderResponseDto = response.data;
        const data = responseJson.content;
        data.forEach(order => {
          ordersDict[`${storeId}_${order.orderNumber}`] = {...order, storeId};
        });
        if (data.length == 0){
          break;
        }
      }
      
    }
    console.log(`Found ${ordersDict.length} orders for storeIds ${this.storeIds} between ${fiveDaysAgo.toISO()} and ${now.toISO()}`);
    const orders = Object.values(ordersDict);
    return orders;
  }

  async getOrder(storeId: number, orderNumber: string): Promise<TrendyolOrderDto | undefined> {
    const url = `/order/sellers/${storeId}/orders?orderNumber=${orderNumber}`;
    const response = await this.client.get(url, this.getHttpConfig(storeId));
    const responseJson: TrendyolOrderResponseDto = {...response.data, storeId};
    const data = responseJson.content.at(0)
    return data;
  }

  _getOrderForSmartbill(trendyolOrder: TrendyolOrderDto, seriesName: string){
    const smartbillOrder = TrendyolSmartbillInvoiceAdapter.toInternal(trendyolOrder, seriesName);
    return smartbillOrder;
  }

  async getOrdersForSmartbill(): Promise<RequestSmartbillInvoiceDto[]> {
    const trendyolOrders = await this.getOrders();
    const seriesNamesDict = Object.fromEntries(
      trendyolOrders.map((trendyolOrder)=> [
        trendyolOrder.storeId, this.config.get<string>(`TRENDYOL_${trendyolOrder.storeId}_SMARTBILL_SERIES_NAME`) as string
      ]
    ));
    const smartbillOrders = trendyolOrders.map((trendyolOrder)=> this._getOrderForSmartbill(trendyolOrder, seriesNamesDict[trendyolOrder.storeId]));
    return smartbillOrders;
  }

  async getOrderForSmartbill(storeId: number, orderNumber: string): Promise<RequestSmartbillInvoiceDto | undefined> {
    const trendyolOrder = await this.getOrder(storeId, orderNumber);
    if(!trendyolOrder){
      return undefined;
    }
    const seriesName = this.config.get<string>(`TRENDYOL_${storeId}_SMARTBILL_SERIES_NAME`);
    if(!seriesName){
      throw `Series name not found for Trendyol API ID: ${storeId}`;
    }
    const smartbillOrder = this._getOrderForSmartbill(trendyolOrder, seriesName);
    return smartbillOrder;
  }

  async _generateOrderForSmartbill(trendyolOrder:TrendyolOrderDto, submitToTrendyol: boolean = false): Promise<RequestSmartbillInvoiceDto> {
    const seriesName = this.config.get<string>(`TRENDYOL_${trendyolOrder.storeId}_SMARTBILL_SERIES_NAME`);
    if(!seriesName){
      throw `Series name not found for Trendyol API ID: ${trendyolOrder.storeId}`;
    }
    const smartbillOrderFormat = this._getOrderForSmartbill(trendyolOrder, seriesName);
    if(!smartbillOrderFormat){
      throw `smartbillOrderFormat couldn't be created for orderNumber: ${trendyolOrder.orderNumber}`;
    }
    const smartbillOrder = await this.smartbill.createInvoice(smartbillOrderFormat);
    if(!smartbillOrder){
      throw `smartbillOrder couldn't be created for orderNumber: ${trendyolOrder.orderNumber}`;
    }
    if(submitToTrendyol){
      const result = await this._submitGeneratedOrderToTrendyol(trendyolOrder.storeId, trendyolOrder.id, smartbillOrder)
      if(!result){
        throw `smartbillOrder for orderNumber ${trendyolOrder.orderNumber} has been created, but that couldn't be submitted to Trendyol. From now on, manual submission of this invoice to the Trendyol is required!`;
      }
    }
    return smartbillOrderFormat;
  }

  async generateOrdersForSmartbill(submitToTrendyol: boolean = false): Promise<RequestSmartbillInvoiceDto[]> {
    const orders = await this.getOrders();
    const smartbillOrders: RequestSmartbillInvoiceDto[] = [];
    for (const trendyolOrder of orders) {
      try {
        const smartbillOrderFormat = await this._generateOrderForSmartbill(trendyolOrder, submitToTrendyol);
        smartbillOrders.push(smartbillOrderFormat);
      } catch (error) {
        console.log(`Error generating Smartbill order for Trendyol order ${trendyolOrder.orderNumber}: ${error}`);
      }
    }
    return smartbillOrders;
  }

  async generateOrderForSmartbill(storeId, orderNumber: string, submitToTrendyol: boolean = false): Promise<RequestSmartbillInvoiceDto> {
    const trendyolOrder = await this.getOrder(storeId, orderNumber);
    if(!trendyolOrder){
      throw `Trendyol order not found for orderNumber: ${orderNumber}`;
    }
    const smartbillOrderFormat = await this._generateOrderForSmartbill(trendyolOrder, submitToTrendyol);
    return smartbillOrderFormat;
  }
  
  async _submitGeneratedOrderToTrendyol(storeId: number, orderId: number, bufferText: Buffer<ArrayBufferLike>){
    const url = `/sellers/${storeId}/seller-invoice-file`;
    // Multipart Body
    const form = new FormData();
    form.append('shipmentPackageId', orderId.toString());
    form.append('file', bufferText, {
      filename: `${orderId}.pdf`,
      contentType: 'application/pdf'
    });

    const response = await this.client.post(url, form, this.getHttpConfig(storeId));
    const success = response.status === 201;
    if(!success){
      console.log(`_submitGeneratedOrderToTrendyol(${orderId}, ...); Response status is not 201, it is ${response.status}. Response body is: ${response.data}`);
    }
    return success;
  }

  async submitGeneratedOrderToTrendyol(storeId: number, smartbillOrderNumber: number){
    const seriesName = this.config.get<string>(`TRENDYOL_${storeId}_SMARTBILL_SERIES_NAME`);
    if(!seriesName){
      throw `Series name not found for Trendyol API ID: ${storeId}`;
    }
    const smartbillOrder = await this.smartbill.getInvoice(seriesName, smartbillOrderNumber);
    const avizNumber = await this.smartbill.getAvizNumberFromInvoice(smartbillOrder);
    if(!avizNumber){
      throw `aviz number not found for invoice with the index: ${smartbillOrderNumber}`;
    }
    const trendyolOrder = await this.getOrder(storeId, avizNumber);
    if (!trendyolOrder){
      throw `Trendyol order not found for aviz number: ${avizNumber}`;
    }
    if(!["Delivered"].includes(trendyolOrder.status)){
      throw `Trendyol order has not been delivered yet Aviz number: ${avizNumber}, Status: ${trendyolOrder.status}`;
    }
    const orderId = trendyolOrder.id;
    // Multipart Body
    const response = await this._submitGeneratedOrderToTrendyol(storeId, orderId, smartbillOrder);
    return response;
  }
}
