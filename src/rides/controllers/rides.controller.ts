import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RidesService } from "../services/rides.service";
import { CreateRideDto } from "../dto/create-ride.dto";
import { UpdateRideDto } from "../dto/update-ride.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RideStatus } from "../schemas/ride.schema";

@ApiTags("rides")
@Controller("rides")
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new ride" })
  @ApiResponse({ status: 201, description: "Ride successfully created" })
  create(@Body() createRideDto: CreateRideDto) {
    return this.ridesService.create(createRideDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all rides" })
  findAll() {
    return this.ridesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a ride by id" })
  @ApiResponse({ status: 200, description: "Return the ride" })
  @ApiResponse({ status: 404, description: "Ride not found" })
  findOne(@Param("id") id: string) {
    return this.ridesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a ride" })
  @ApiResponse({ status: 200, description: "Ride successfully updated" })
  @ApiResponse({ status: 404, description: "Ride not found" })
  update(@Param("id") id: string, @Body() updateRideDto: UpdateRideDto) {
    return this.ridesService.update(id, updateRideDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update ride status" })
  @ApiResponse({ status: 200, description: "Ride status updated" })
  @ApiResponse({ status: 404, description: "Ride not found" })
  updateStatus(@Param("id") id: string, @Body("status") status: RideStatus) {
    return this.ridesService.update(id, { status });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a ride" })
  @ApiResponse({ status: 200, description: "Ride successfully deleted" })
  @ApiResponse({ status: 404, description: "Ride not found" })
  remove(@Param("id") id: string) {
    return this.ridesService.remove(id);
  }
}
