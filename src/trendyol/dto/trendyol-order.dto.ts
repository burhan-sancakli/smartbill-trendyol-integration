import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";
import { AddressDto } from "./trendyol-address.dto";
import { LineItemDto } from "./trendyol-line-item.dto";
import { PackageHistoryDto } from "./trendyol-package-history.dto";

export class TrendyolOrderDto {
  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type1(() => AddressDto)
  shipmentAddress: AddressDto;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type2(() => AddressDto)
  invoiceAddress: AddressDto;

  @ApiProperty()
  @IsString()
  id: number;

  @ApiProperty()
  @IsString()
  orderNumber: string;

  @ApiProperty()
  @IsNumber()
  grossAmount: number;

  @ApiProperty()
  @IsNumber()
  totalDiscount: number;

  @ApiProperty()
  @IsNumber()
  totalTyDiscount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty()
  @IsString()
  customerFirstName: string;

  @ApiProperty()
  @IsString()
  customerLastName: string;

  @ApiProperty()
  @IsString()
  customerEmail: string;

  @ApiProperty()
  @IsNumber()
  customerId: number;

  @ApiProperty()
  @IsString()
  cargoProviderName: string;

  @ApiProperty()
  @IsNumber()
  cargoTrackingNumber: number;

  @ApiProperty()
  @IsString()
  cargoTrackingLink: string;

  @ApiProperty({ type: [LineItemDto] })
  @ValidateNested({ each: true })
  @Type3(() => LineItemDto)
  lines: LineItemDto[];

  @ApiProperty()
  @IsNumber()
  orderDate: number;

  @ApiProperty()
  @IsString()
  identityNumber: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({ type: [PackageHistoryDto] })
  @ValidateNested({ each: true })
  @Type4(() => PackageHistoryDto)
  packageHistories: PackageHistoryDto[];

  @ApiProperty()
  @IsString()
  shipmentPackageStatus: string;

  @ApiProperty()
  @IsBoolean()
  fastDelivery: boolean;

  @ApiProperty()
  @IsNumber()
  originShipmentDate: number;

  @ApiProperty()
  @IsNumber()
  estimatedDeliveryStartDate: number;

  @ApiProperty()
  @IsNumber()
  estimatedDeliveryEndDate: number;

  @ApiProperty()
  @IsBoolean()
  containsDangerousProduct: boolean;

  @ApiProperty()
  @IsNumber()
  storeId: number;
}

function Type1(arg0: () => any): (target: TrendyolOrderDto, propertyKey: "shipmentAddress") => void {
    throw new Error("Function not implemented.");
}

function Type2(arg0: () => any): (target: TrendyolOrderDto, propertyKey: "invoiceAddress") => void {
    throw new Error("Function not implemented.");
}
function Type3(arg0: () => any): (target: TrendyolOrderDto, propertyKey: "lines") => void {
    throw new Error("Function not implemented.");
}
function Type4(arg0: () => any): (target: TrendyolOrderDto, propertyKey: "packageHistories") => void {
    throw new Error("Function not implemented.");
}
