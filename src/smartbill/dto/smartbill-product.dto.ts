import { IsString, IsOptional, IsInt, IsBoolean, IsNumber } from "class-validator";
import { RequestSmartbillProductDto } from "./request-smartbill-product.dto";

export class SmartbillProductDto extends RequestSmartbillProductDto {
  @IsBoolean()
  saveToDb: boolean;
}