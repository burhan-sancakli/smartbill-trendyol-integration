import { RequestSmartbillCancelInvoiceDto } from "../dto/request-smartbill-cancel-invoice.dto";
import { SmartbillCancelInvoiceDto } from "../dto/smartbill-cancel-invoice.dto";

export class SmartbillCancelInvoiceAdapter {
  static toInternal(requestDto: RequestSmartbillCancelInvoiceDto, options: { companyVatCode: string; issueDate: string; }): SmartbillCancelInvoiceDto {
    return {
      ...requestDto,
      companyVatCode: options.companyVatCode,
      issueDate: options.issueDate,
    };
  }
}
