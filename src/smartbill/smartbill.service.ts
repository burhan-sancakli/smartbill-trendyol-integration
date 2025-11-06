import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SmartbillInvoiceDto } from './dto/smartbill-invoice.dto';
import { ConfigService } from '@nestjs/config';
import { TaxDto } from './dto/smartbill-tax.dto';
import { SmartbillTaxesResponseDto } from './dto/smartbill-tax-response.dto';
@Injectable()
export class SmartbillService {
  private readonly config: ConfigService;
  private readonly client: AxiosInstance;
  constructor(config: ConfigService) {
    this.config = config; 
    this.client = axios.create({
      baseURL: this.config.get<string>('SMARTBILL_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.config.get<string>('SMARTBILL_EMAIL')}:${this.config.get<string>('SMARTBILL_TOKEN')}`).toString('base64'),
      },
      timeout: 5000,
    });
  }

  async getTaxes(): Promise<TaxDto[]>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const url = `/tax?cif=${cif}`;
    const response = await this.client.get(url);
    const responseJson: SmartbillTaxesResponseDto = response.data;
    const data = responseJson.taxes;
    return data;
  }

  async getInvoice(number: string): Promise<Buffer>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const seriesName = this.config.get<string>('SMARTBILL_SERIES_NAME') || "";
    const url = `/invoice/pdf?cif=${cif}&seriesname=${seriesName}&number=${number}`;
    const response = await this.client.get(url, {
      responseType: 'arraybuffer', // 👈 wichtig: für PDF-Download
    });
    return Buffer.from(response.data);
  }

  async createInvoice(requestDto: SmartbillInvoiceDto): Promise<any>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const seriesName = this.config.get<string>('SMARTBILL_SERIES_NAME') || "";
    const url = `/invoice`;
    const response = await this.client.post(url,requestDto);
    return response.data;
  }

  findAll() {
    return `This action returns all smartbill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} smartbill`;
  }

  remove(id: number) {
    return `This action removes a #${id} smartbill`;
  }
}
