import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { DriversService } from "../services/drivers.service";
import { CreateDriverDto } from "../dto/create-driver.dto";
import { UpdateDriverDto } from "../dto/update-driver.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("drivers")
@Controller("drivers")
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: "Create a new driver" })
  @ApiResponse({ status: 201, description: "Driver successfully created" })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all drivers" })
  findAll() {
    return this.driversService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a driver by id" })
  findOne(@Param("id") id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a driver" })
  update(@Param("id") id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a driver" })
  remove(@Param("id") id: string) {
    return this.driversService.remove(id);
  }
}
