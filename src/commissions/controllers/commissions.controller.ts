import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionsService } from '../services/commissions.service';
import { CreateCommissionDto } from '../dto/create-commission.dto';
import { UpdateCommissionDto } from '../dto/update-commission.dto';

@ApiTags('commissions')
@Controller('commissions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commission' })
  @ApiResponse({ status: 201, description: 'Commission créée avec succès' })
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commissions' })
  @ApiResponse({ status: 200, description: 'Liste des commissions' })
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des commissions' })
  @ApiResponse({ status: 200, description: 'Statistiques des commissions' })
  getStats(
    @Query('driverId') driverId?: string,
    @Query('businessId') businessId?: string,
  ) {
    return this.commissionsService.getCommissionStats(driverId, businessId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Récupérer les commissions d\'un conducteur' })
  @ApiResponse({ status: 200, description: 'Commissions du conducteur' })
  findByDriver(@Param('driverId') driverId: string) {
    return this.commissionsService.findByDriver(driverId);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Récupérer les commissions d\'une entreprise' })
  @ApiResponse({ status: 200, description: 'Commissions de l\'entreprise' })
  findByBusiness(@Param('businessId') businessId: string) {
    return this.commissionsService.findByBusiness(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commission par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la commission' })
  @ApiResponse({ status: 404, description: 'Commission non trouvée' })
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une commission' })
  @ApiResponse({ status: 200, description: 'Commission mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Commission non trouvée' })
  update(@Param('id') id: string, @Body() updateCommissionDto: UpdateCommissionDto) {
    return this.commissionsService.update(id, updateCommissionDto);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Marquer une commission comme payée' })
  @ApiResponse({ status: 200, description: 'Commission marquée comme payée' })
  @ApiResponse({ status: 404, description: 'Commission non trouvée' })
  markAsPaid(@Param('id') id: string) {
    return this.commissionsService.markAsPaid(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commission' })
  @ApiResponse({ status: 200, description: 'Commission supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Commission non trouvée' })
  remove(@Param('id') id: string) {
    return this.commissionsService.remove(id);
  }
}
