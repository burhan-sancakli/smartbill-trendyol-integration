import { IsString, IsBoolean, IsEmail } from "class-validator";
import { RequestSmartbillClientDto } from "./request-smartbill-client.dto";

export class SmartbillClientDto extends RequestSmartbillClientDto {
  @IsBoolean()
  saveToDb: boolean;
}