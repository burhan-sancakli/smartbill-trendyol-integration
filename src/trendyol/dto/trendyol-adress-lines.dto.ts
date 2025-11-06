import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AddressLinesDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  addressLine2?: string;
}