import { IsString, IsBoolean, IsEmail } from "class-validator";

export class RequestSmartbillClientDto {
  @IsString()
  name: string;

  @IsString()
  vatCode: string;

  @IsString()
  address: string;

  @IsBoolean()
  isTaxPayer: boolean;

  @IsString()
  city: string;

  @IsString()
  county: string;

  @IsString()
  country: string;

  @IsEmail()
  email: string;
}