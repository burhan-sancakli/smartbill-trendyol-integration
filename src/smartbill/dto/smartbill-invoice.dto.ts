import { IsString, ValidateNested, IsBoolean, IsDateString, IsArray, IsInt, IsOptional } from "class-validator";
import { SmartbillClientDto } from "./smartbill-client.dto";
import { SmartbillProductDto } from "./smartbill-product.dto";
import { Type } from "class-transformer";
import { RequestSmartbillInvoiceDto } from "./request-smartbill-invoice.dto";

export class SmartbillInvoiceDto extends RequestSmartbillInvoiceDto {
  @IsString()
  companyVatCode: string;

  @ValidateNested()
  @Type(() => SmartbillClientDto)
  declare client: SmartbillClientDto;

  @IsBoolean()
  isDraft: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmartbillProductDto)
  declare products: SmartbillProductDto[];

  @IsString()
  issuerName: string;

  @IsBoolean()
  useStock: boolean;
}