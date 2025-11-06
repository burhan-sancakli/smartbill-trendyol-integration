import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { TaxDto } from "./smartbill-tax.dto";

export class SmartbillTaxesResponseDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  errorText?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  series?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ type: [TaxDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxDto)
  taxes: TaxDto[];
}

function Type(arg0: () => any): (target: SmartbillTaxesResponseDto, propertyKey: "taxes") => void {
    throw new Error("Function not implemented.");
}