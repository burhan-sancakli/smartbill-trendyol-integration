import { SmartbillInvoiceDto } from "../dto/smartbill-invoice.dto";
import { RequestSmartbillInvoiceDto } from "../dto/request-smartbill-invoice.dto";

export class SmartbillInvoiceAdapter {
  static toInternal(requestDto: RequestSmartbillInvoiceDto, options: { companyVatCode: string; issuerName: string; isDraft?: boolean }): SmartbillInvoiceDto {
    return {
      ...requestDto,
      companyVatCode: options.companyVatCode,
      isDraft: options.isDraft ?? false,
      client: {
        ...requestDto.client,
        saveToDb: false,
      },
      products: requestDto.products.map((product) => ({
        ...product,
        saveToDb: false,
      })),
      issuerName: options.issuerName,
      useStock:false,
    };
  }
}
