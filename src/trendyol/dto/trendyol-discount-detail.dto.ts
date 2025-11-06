import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class DiscountDetailDto {
  @ApiProperty()
  @IsNumber()
  lineItemPrice: number;

  @ApiProperty()
  @IsNumber()
  lineItemDiscount: number;

  @ApiProperty()
  @IsNumber()
  lineItemTyDiscount: number;
}