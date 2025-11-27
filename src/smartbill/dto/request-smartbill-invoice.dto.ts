import { IsString, ValidateNested, IsBoolean, IsDateString, IsArray, IsInt, IsOptional } from "class-validator";
import { SmartbillClientDto } from "./smartbill-client.dto";
import { SmartbillProductDto } from "./smartbill-product.dto";
import { Type } from "class-transformer";
import { RequestSmartbillProductDto } from "./request-smartbill-product.dto";
import { RequestSmartbillClientDto } from "./request-smartbill-client.dto";

export class RequestSmartbillInvoiceDto {
  @ValidateNested()
  @Type(() => RequestSmartbillClientDto)
  client: RequestSmartbillClientDto;

  @IsString()
  seriesName: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  deliveryDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestSmartbillProductDto)
  products: RequestSmartbillProductDto[];

  @IsString()
  currency: string;

  @IsString()
  language: string;

  @IsInt()
  precision: number;

  @IsOptional()
  @IsString()
  aviz?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  mentions?: string;
}