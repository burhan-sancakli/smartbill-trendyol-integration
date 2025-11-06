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

  @ApiProperty({ type: [DiscountDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountDetailDto)
  discountDetails: DiscountDetailDto[];

  @ApiProperty()
  @IsString()
  currencyCode: string;

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
