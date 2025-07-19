import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { VehiclesService } from "../services/vehicles.service";
import { CreateVehicleDto } from "../dto/create-vehicle.dto";
import { UpdateVehicleDto } from "../dto/update-vehicle.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("vehicles")
@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new vehicle" })
  @ApiResponse({ status: 201, description: "Vehicle successfully created" })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all vehicles" })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a vehicle by id" })
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a vehicle" })
  update(@Param("id") id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a vehicle" })
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(id);
  }
}
