import { IsString, IsBoolean, IsEmail, IsNumber, IsDate } from "class-validator";
import { RequestSmartbillCancelInvoiceDto } from "./request-smartbill-cancel-invoice.dto";

export class SmartbillCancelInvoiceDto extends RequestSmartbillCancelInvoiceDto {
  @IsString()
  companyVatCode: string;

  @IsString()
  issueDate: string;
}