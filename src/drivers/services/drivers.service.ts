import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Driver, DriverDocument } from "../schemas/driver.schema";
import { CreateDriverDto } from "../dto/create-driver.dto";
import { UpdateDriverDto } from "../dto/update-driver.dto";

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const createdDriver = new this.driverModel(createDriverDto);
    return createdDriver.save();
  }

  async findAll(): Promise<Driver[]> {
    return this.driverModel.find().populate("user").populate("business").exec();
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverModel
      .findById(id)
      .populate("user")
      .populate("business")
      .exec();
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const updatedDriver = await this.driverModel
      .findByIdAndUpdate(id, updateDriverDto, { new: true })
      .populate("user")
      .populate("business")
      .exec();
    if (!updatedDriver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
    return updatedDriver;
  }

  async remove(id: string): Promise<void> {
    const result = await this.driverModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
  }
}
