import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateBusinessDto } from "../dto/create-business.dto";
import { UpdateBusinessDto } from "../dto/update-business.dto";
import { Business, BusinessDocument } from "../schemas/business.schema";

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    // Vérifier si l'utilisateur a déjà une entreprise
    const existingBusiness = await this.businessModel.findOne({
      user: createBusinessDto.user,
    });
    if (existingBusiness) {
      throw new ConflictException("L'utilisateur possède déjà une entreprise");
    }

    const createdBusiness = new this.businessModel(createBusinessDto);
    return createdBusiness.save();
  }

  async findAll(): Promise<Business[]> {
    return this.businessModel.find().populate("user").exec();
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessModel
      .findById(id)
      .populate("user")
      .exec();
    if (!business) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée`);
    }
    return business;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto
  ): Promise<Business> {
    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(id, updateBusinessDto, { new: true })
      .exec();
    if (!updatedBusiness) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée`);
    }
    return updatedBusiness;
  }

  async remove(id: string): Promise<void> {
    const result = await this.businessModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée`);
    }
  }
}
