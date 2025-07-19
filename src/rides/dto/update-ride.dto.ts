import { PartialType } from "@nestjs/swagger";
import { CreateRideDto } from "./create-ride.dto";
import { IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RideStatus } from "../schemas/ride.schema";

export class UpdateRideDto extends PartialType(CreateRideDto) {
  @ApiProperty({ enum: RideStatus, required: false })
  @IsEnum(RideStatus)
  @IsOptional()
  status?: RideStatus;
}
