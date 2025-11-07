import { IsString, IsOptional, IsInt, IsBoolean, IsNumber } from "class-validator";

export class RequestSmartbillProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsInt()
  numberOfItems?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsBoolean()
  isDiscount: boolean;

  @IsOptional()
  @IsInt()
  discountType?: number;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

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

  @IsOptional()
  @IsBoolean()
  isService?: boolean;
}