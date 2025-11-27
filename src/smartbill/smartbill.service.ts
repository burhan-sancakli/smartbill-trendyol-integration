import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SmartbillInvoiceDto } from './dto/smartbill-invoice.dto';
import { ConfigService } from '@nestjs/config';
import { TaxDto } from './dto/smartbill-tax.dto';
import { SmartbillTaxesResponseDto } from './dto/smartbill-tax-response.dto';
import { RequestSmartbillInvoiceDto } from './dto/request-smartbill-invoice.dto';
import { SmartbillInvoiceAdapter } from './adapters/smartbill-invoice.adapter';
import { pdfToText } from 'pdf-ts';
import * as fs from 'fs';
import * as path from 'path';
import { TrendyolService } from 'src/trendyol/trendyol.service';
import { RequestSmartbillCancelInvoiceDto } from './dto/request-smartbill-cancel-invoice.dto';
import { SmartbillCancelInvoiceAdapter } from './adapters/smartbill-cancel-invoice.adapter';
import { DateTime } from 'luxon';
@Injectable()
export class SmartbillService {
  private readonly client: AxiosInstance;
  private lastRequestTime = 0;
  private readonly delayMs = 340; // 0.34 Sekunden zwischen Requests
  constructor(
    private readonly config: ConfigService, 
    @Inject(forwardRef(() => TrendyolService)) private readonly trendyolService: TrendyolService
  ) {
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

  async getSeriesNameNumberFromInvoice(bufferText: Buffer){
    const text = await pdfToText(bufferText);
    const match = text.split("\n")[0];
    if (!match) {
      throw "Keine 'SeriesName' Oder 'Nummer' gefunden.";
    }
    return match;
  }

  async getAvizNumberFromInvoice(bufferText: Buffer){
    const text = await pdfToText(bufferText);
    const match = text.match(/Nr\s*aviz:\s*(\S+)/);
    if (!match) {
      throw "Keine 'Nr aviz'-Nummer gefunden.";
    }
    const nrAviz = match[1];
    return nrAviz;
  }

  getLocalInvoiceFile(seriesName: string | null = null, number: number | null = null, storeId: number | null = null, orderNumber: string | null = null): Buffer | null {
    if(!(seriesName && number) && !(storeId && orderNumber)){
      throw new Error("Either seriesName and number or storeId and orderNumber must be provided.");
    }
    const paddedNumber = number ?String(number).padStart(4, '0') : null;
    const folderPath = path.join("data");
    const fileNames = fs.readdirSync(folderPath);
    const regexPattern = `^invoice-${storeId ?? "(.+)"}-${paddedNumber ? seriesName+paddedNumber : "(.+)"}-${orderNumber ?? "(.+)"}\\.pdf$`;
    const regex = new RegExp(regexPattern);

    for (const fileName of fileNames) {
      if (regex.test(fileName)) {
        const filePath = path.join(folderPath, fileName); // Datei gefunden
        const file = fs.readFileSync(filePath);
        return file;
      }
    }
    return null; // Keine passende Datei
  }

  async getInvoice(seriesName: string, number: number): Promise<Buffer>  {
    const file = this.getLocalInvoiceFile(seriesName, number);
    if(file){
      return file;
    }
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const paddedNumber = String(number).padStart(4, '0');
    const url = `/invoice/pdf?cif=${cif}&seriesname=${seriesName}&number=${paddedNumber}`;
    const response = await this.client.get(url, {
      responseType: 'arraybuffer', // 👈 wichtig: für PDF-Download
    });
    const bufferText = Buffer.from(response.data);
    const storeId = this.trendyolService.getStoreIdFromSeriesName(seriesName);
    const orderNumber = await this.getAvizNumberFromInvoice(bufferText);
    const folderPath = path.join("data");
    const filePath = path.join(folderPath, `invoice-${storeId}-${seriesName}${paddedNumber}-${orderNumber}.pdf`);
    // Ordner sicherstellen
    fs.mkdirSync(path.dirname(folderPath), { recursive: true });
    // Datei speichern
    fs.writeFileSync(filePath, bufferText);
    return bufferText;
  }

  async createInvoice(requestDto: RequestSmartbillInvoiceDto): Promise<Buffer>  {
    const storeId = this.trendyolService.getStoreIdFromSeriesName(requestDto.seriesName);
    const existingOrder = this.getLocalInvoiceFile(null, null, storeId, requestDto.aviz);
    if(existingOrder){
      return existingOrder;
    }
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const issuerName = this.config.get<string>('SMARTBILL_COMPANY_NAME') || "";
    const url = `/invoice`;
    const smartbillInvoiceDto = SmartbillInvoiceAdapter.toInternal(requestDto, {
      companyVatCode: cif, issuerName: issuerName
    });
   
    const response = await this.client.post(url,smartbillInvoiceDto);
    const smartbillInvoice = await this.getInvoice(smartbillInvoiceDto.seriesName, parseInt(response.data.number));
    return smartbillInvoice;
  }

  async cancelInvoice(requestDto: RequestSmartbillCancelInvoiceDto): Promise<Buffer>  {
    const cif = this.config.get<string>('SMARTBILL_VAT_CODE') || "";
    const issueDate = DateTime.now().setZone('Europe/Bucharest').toISODate()?.split("T")[0] as string;
    const smartbillCancelInvoiceDto = SmartbillCancelInvoiceAdapter.toInternal(requestDto, {
      companyVatCode: cif, issueDate: issueDate
    });
    const url = `/invoice/reverse`;
    const response = await this.client.post(url,smartbillCancelInvoiceDto);
    const smartbillInvoice = await this.getInvoice(smartbillCancelInvoiceDto.seriesName, parseInt(response.data.number));
    return smartbillInvoice;
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
