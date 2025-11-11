import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SmartbillInvoiceDto } from './dto/smartbill-invoice.dto';
import { ConfigService } from '@nestjs/config';
import { TaxDto } from './dto/smartbill-tax.dto';
import { SmartbillTaxesResponseDto } from './dto/smartbill-tax-response.dto';
import { RequestSmartbillInvoiceDto } from './dto/request-smartbill-invoice.dto';
import { SmartbillInvoiceAdapter } from './adapters/smartbill-invoice.adapter';
import { pdfToText } from 'pdf-ts';
@Injectable()
export class SmartbillService {
  private readonly config: ConfigService;
  private readonly client: AxiosInstance;
  private lastRequestTime = 0;
  private readonly delayMs = 340; // 0.34 Sekunden zwischen Requests
  constructor(config: ConfigService) {
    this.config = config;
    const email = this.config.get<string>('SMARTBILL_EMAIL');
    const token = this.config.get<string>('SMARTBILL_TOKEN');

    this.client = axios.create({
      baseURL: this.config.get<string>('SMARTBILL_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${email}:${token}`).toString('base64'),
      },
      timeout: 5000,
    });
    // 🕒 Interceptor für den festen Delay zwischen Requests
    this.client.interceptors.request.use(async (config) => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;

      if (elapsed < this.delayMs) {
        const wait = this.delayMs - elapsed;
        console.log(`Warte ${wait} ms, um Rate Limit einzuhalten...`);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }

      this.lastRequestTime = Date.now();
      return config;
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

  async getAvizNumberFromInvoice(bufferText: Buffer){
    const text = await pdfToText(bufferText);
    const match = text.match(/Nr\s*aviz:\s*(\S+)/);
    if (match) {
      const nrAviz = match[1];
      return nrAviz;
    } else {
      console.log("Keine 'Nr aviz'-Nummer gefunden.");
    }
  }

  async getInvoice(number: number): Promise<Buffer>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const seriesName = this.config.get<string>('SMARTBILL_SERIES_NAME') || "";
    const paddedNumber = String(number).padStart(4, '0');
    const url = `/invoice/pdf?cif=${cif}&seriesname=${seriesName}&number=${paddedNumber}`;
    const response = await this.client.get(url, {
      responseType: 'arraybuffer', // 👈 wichtig: für PDF-Download
    });
    const bufferText = Buffer.from(response.data);
    const avizNumber = await this.getAvizNumberFromInvoice(bufferText);
    console.log(avizNumber);
    return Buffer.from(response.data);
  }

  async createInvoice(requestDto: RequestSmartbillInvoiceDto): Promise<any>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || ""
    const issuerName = this.config.get<string>('SMARTBILL_COMPANY_NAME') || "";
    const seriesName = this.config.get<string>('SMARTBILL_SERIES_NAME') || "";
    const url = `/invoice`;
    const smartbillInvoiceDto = SmartbillInvoiceAdapter.toInternal(requestDto, {
      companyVatCode: cif, issuerName: issuerName, seriesName: seriesName
    });
   
    const response = await this.client.post(url,smartbillInvoiceDto);
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
