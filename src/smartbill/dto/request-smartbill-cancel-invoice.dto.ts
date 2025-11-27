import { IsString, IsBoolean, IsEmail, IsNumber } from "class-validator";

export class RequestSmartbillCancelInvoiceDto {
  @IsString()
  seriesName: string;

  @IsNumber()
  number: number;
}