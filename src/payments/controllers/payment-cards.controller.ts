import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentCardsService, CreatePaymentCardDto, UpdatePaymentCardDto } from '../services/payment-cards.service';

@ApiTags('payment-cards')
@Controller('payment-cards')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentCardsController {
  constructor(private readonly paymentCardsService: PaymentCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter une nouvelle carte de paiement' })
  @ApiResponse({ status: 201, description: 'Carte ajoutée avec succès' })
  create(@Body() createPaymentCardDto: CreatePaymentCardDto) {
    return this.paymentCardsService.create(createPaymentCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les cartes de paiement' })
  @ApiResponse({ status: 200, description: 'Liste des cartes' })
  findAll() {
    return this.paymentCardsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les cartes d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Cartes de l\'utilisateur' })
  findByUser(@Param('userId') userId: string) {
    return this.paymentCardsService.findByUser(userId);
  }

  @Get('user/:userId/default')
  @ApiOperation({ summary: 'Récupérer la carte par défaut d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Carte par défaut' })
  findDefault(@Param('userId') userId: string) {
    return this.paymentCardsService.findDefault(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une carte par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la carte' })
  @ApiResponse({ status: 404, description: 'Carte non trouvée' })
  findOne(@Param('id') id: string) {
    return this.paymentCardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une carte' })
  @ApiResponse({ status: 200, description: 'Carte mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Carte non trouvée' })
  update(@Param('id') id: string, @Body() updatePaymentCardDto: UpdatePaymentCardDto) {
    return this.paymentCardsService.update(id, updatePaymentCardDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Définir comme carte par défaut' })
  @ApiResponse({ status: 200, description: 'Carte définie comme défaut' })
  @ApiResponse({ status: 404, description: 'Carte non trouvée' })
  setAsDefault(@Param('id') id: string) {
    return this.paymentCardsService.setAsDefault(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver une carte' })
  @ApiResponse({ status: 200, description: 'Carte désactivée' })
  @ApiResponse({ status: 404, description: 'Carte non trouvée' })
  deactivate(@Param('id') id: string) {
    return this.paymentCardsService.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une carte' })
  @ApiResponse({ status: 200, description: 'Carte supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Carte non trouvée' })
  remove(@Param('id') id: string) {
    return this.paymentCardsService.remove(id);
  }
}
