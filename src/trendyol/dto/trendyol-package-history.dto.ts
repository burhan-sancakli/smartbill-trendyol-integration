import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class PackageHistoryDto {
  @ApiProperty()
  @IsNumber()
  createdDate: number;

  @ApiProperty()
  @IsString()
  status: string;
}