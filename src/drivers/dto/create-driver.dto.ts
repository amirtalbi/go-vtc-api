import { IsString, IsDate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateDriverDto {
  @ApiProperty({ example: "VTC123456" })
  @IsString()
  vtc_card_number!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  vtc_card_expiry!: Date;

  @ApiProperty({ example: "12345678" })
  @IsString()
  driving_license!: string;

  @ApiProperty()
  @IsString()
  user!: string;

  @ApiProperty()
  @IsString()
  business!: string;
}
