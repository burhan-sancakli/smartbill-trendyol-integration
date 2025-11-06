import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";

export class SmartbillProductDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsInt()
  quantity: number;

  @IsInt()
  price: number;

  @IsBoolean()
  isDiscount: boolean;

  @IsBoolean()
  isTaxIncluded: boolean;

  @IsString()
  measuringUnitName: string;

  @IsString()
  currency: string;

  @IsString()
  taxName: string;

  @IsInt()
  taxPercentage: number;

  @IsBoolean()
  isService: boolean;

  @IsBoolean()
  saveToDb: boolean;
}