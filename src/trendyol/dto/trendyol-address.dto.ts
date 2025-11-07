import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AddressLinesDto } from "./trendyol-adress-lines.dto";

export class AddressDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty()
  @IsString()
  address1: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty()
  @IsString()
  countyName: string;

  @ApiProperty({ type: AddressLinesDto })
  @ValidateNested()
  @Type(() => AddressLinesDto)
  addressLines: AddressLinesDto;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsString()
  fullAddress: string;

  @ApiProperty()
  @IsString()
  fullName: string;
}

function Type(arg0: () => any): (target: AddressDto, propertyKey: "addressLines") => void {
    throw new Error("Function not implemented.");
}
