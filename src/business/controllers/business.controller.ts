import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { BusinessService } from "../services/business.service";
import { CreateBusinessDto } from "../dto/create-business.dto";
import { UpdateBusinessDto } from "../dto/update-business.dto";
import { ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";
import { Business } from "../schemas/business.schema";

@ApiTags("business")
@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @ApiBody({ type: CreateBusinessDto })
  @ApiResponse({
    status: 201,
    description: "Entreprise créée avec succès",
    type: Business,
  })
  @ApiResponse({
    status: 409,
    description: "L'utilisateur possède déjà une entreprise",
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto
  ): Promise<Business> {
    return this.businessService.create(createBusinessDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Liste des entreprises",
    type: [Business],
  })
  async findAll(): Promise<Business[]> {
    return this.businessService.findAll();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Entreprise trouvée",
    type: Business,
  })
  @ApiResponse({ status: 404, description: "Entreprise non trouvée" })
  async findOne(@Param("id") id: string): Promise<Business> {
    return this.businessService.findOne(id);
  }

  @Patch(":id")
  @ApiBody({ type: UpdateBusinessDto })
  @ApiResponse({
    status: 200,
    description: "Entreprise mise à jour",
    type: Business,
  })
  @ApiResponse({ status: 404, description: "Entreprise non trouvée" })
  async update(
    @Param("id") id: string,
    @Body() updateBusinessDto: UpdateBusinessDto
  ): Promise<Business> {
    return this.businessService.update(id, updateBusinessDto);
  }

  @Delete(":id")
  @ApiResponse({ status: 200, description: "Entreprise supprimée avec succès" })
  @ApiResponse({ status: 404, description: "Entreprise non trouvée" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.businessService.remove(id);
  }
}
