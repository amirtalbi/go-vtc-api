import {
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { RideStatus } from "../schemas/ride.schema";

export class CreateRideDto {
  @ApiProperty({ example: "123 Main St, Paris" })
  @IsString()
  pickup_location!: string;

  @ApiProperty({ example: "456 Side St, Paris" })
  @IsString()
  dropoff_location!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  pickup_time!: Date;

  @ApiProperty({ example: 10.5 })
  @IsNumber()
  estimated_distance!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  estimated_duration!: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  price!: number;

  @ApiProperty({ enum: RideStatus })
  @IsEnum(RideStatus)
  status!: RideStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  driver?: string;

  @ApiProperty()
  @IsString()
  customer!: string;

  @ApiProperty()
  @IsString()
  business!: string;
}
