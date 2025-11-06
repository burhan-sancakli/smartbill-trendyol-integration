import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, ValidateNested } from "class-validator";
import { TrendyolOrderDto } from "./trendyol-order.dto";

export class TrendyolOrderResponseDto {
  @ApiProperty()
  @IsNumber()
  totalElements: number;

  @ApiProperty()
  @IsNumber()
  totalPages: number;

  @ApiProperty()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty({ type: [TrendyolOrderDto] })
  @ValidateNested({ each: true })
  @Type(() => TrendyolOrderDto)
  content: TrendyolOrderDto[];
}

function Type(arg0: () => any): (target: TrendyolOrderResponseDto, propertyKey: "content") => void {
    throw new Error("Function not implemented.");
}