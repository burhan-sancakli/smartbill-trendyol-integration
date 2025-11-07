import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsArray, ValidateNested } from "class-validator";
import { DiscountDetailDto } from "./trendyol-discount-detail.dto";

export class LineItemDto {
  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  productCode: number;

  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  merchantSku: string;

  @ApiProperty()
  @IsNumber()
  merchantId: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  tyDiscount: number;

  @ApiProperty({ type: [DiscountDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountDetailDto)
  discountDetails: DiscountDetailDto[];

  @ApiProperty()
  @IsString()
  currencyCode: string;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsNumber()
  vatBaseAmount: number;

  @ApiProperty()
  @IsString()
  barcode: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  orderLineItemStatusName: string;
}

function Type(arg0: () => any): (target: LineItemDto, propertyKey: "discountDetails") => void {
    throw new Error("Function not implemented.");
}
