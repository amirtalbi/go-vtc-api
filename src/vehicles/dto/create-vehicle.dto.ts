import { IsString, IsDate, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({ example: "Mercedes" })
  @IsString()
  brand!: string;

  @ApiProperty({ example: "Classe S" })
  @IsString()
  model!: string;

  @ApiProperty({ example: "AA-123-BB" })
  @IsString()
  plate_number!: string;

  @ApiProperty()
  @IsString()
  registration_card!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  insurance_expiry!: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  technical_inspection_expiry!: Date;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(2)
  seats!: number;

  @ApiProperty()
  @IsString()
  business!: string;
}
