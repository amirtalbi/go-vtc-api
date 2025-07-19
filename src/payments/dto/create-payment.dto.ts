import { IsString, IsNumber, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentStatus } from "../schemas/payment.schema";

export class CreatePaymentDto {
  @ApiProperty({ example: 50.00 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: "card" })
  @IsString()
  payment_method!: string;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiProperty()
  @IsString()
  ride!: string;

  @ApiProperty()
  @IsString()
  customer!: string;
}