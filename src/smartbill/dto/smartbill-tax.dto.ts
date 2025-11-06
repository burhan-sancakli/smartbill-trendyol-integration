import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class TaxDto {
  @ApiProperty({ example: 'Normala' })
  @IsString()
  name: string;

  @ApiProperty({ example: 21.0 })
  @IsNumber()
  percentage: number;
}