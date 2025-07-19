import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Ride, RideDocument } from "../schemas/ride.schema";
import { CreateRideDto } from "../dto/create-ride.dto";
import { UpdateRideDto } from "../dto/update-ride.dto";

@Injectable()
export class RidesService {
  constructor(@InjectModel(Ride.name) private rideModel: Model<RideDocument>) {}

  async create(createRideDto: CreateRideDto): Promise<Ride> {
    const createdRide = new this.rideModel(createRideDto);
    return createdRide.save();
  }

  async findAll(): Promise<Ride[]> {
    return this.rideModel
      .find()
      .populate("driver")
      .populate("customer")
      .populate("business")
      .exec();
  }

  async findOne(id: string): Promise<Ride> {
    const ride = await this.rideModel
      .findById(id)
      .populate("driver")
      .populate("customer")
      .populate("business")
      .exec();
    if (!ride) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }
    return ride;
  }

  async update(id: string, updateRideDto: UpdateRideDto): Promise<Ride> {
    const updatedRide = await this.rideModel
      .findByIdAndUpdate(id, updateRideDto, { new: true })
      .populate("driver")
      .populate("customer")
      .populate("business")
      .exec();
    if (!updatedRide) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }
    return updatedRide;
  }

  async remove(id: string): Promise<void> {
    const result = await this.rideModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }
  }
}
