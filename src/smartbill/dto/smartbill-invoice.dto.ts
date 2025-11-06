import { IsString, ValidateNested, IsBoolean, IsDateString, IsArray, IsInt, IsOptional } from "class-validator";
import { SmartbillClientDto } from "./smartbill-client.dto";
import { SmartbillProductDto } from "./smartbill-product.dto";
import { Type } from "class-transformer";

export class SmartbillInvoiceDto {
  @IsString()
  companyVatCode: string;

  @ValidateNested()
  @Type(() => SmartbillClientDto)
  client: SmartbillClientDto;

  @IsBoolean()
  isDraft: boolean;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  deliveryDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmartbillProductDto)
  products: SmartbillProductDto[];

  @IsString()
  currency: string;

  @IsString()
  language: string;

  @IsInt()
  precision: number;

  @IsString()
  issuerName: string;

  @IsOptional()
  @IsString()
  aviz?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  mentions?: string;

  @IsBoolean()
  useStock: boolean;
}