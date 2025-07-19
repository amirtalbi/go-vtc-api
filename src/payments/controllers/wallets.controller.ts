import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { 
  WalletsService, 
  CreateWalletDto, 
  AddFundsDto, 
  WithdrawFundsDto, 
  TransferFundsDto 
} from '../services/wallets.service';
import { TransactionType } from '../schemas/wallet.schema';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau portefeuille' })
  @ApiResponse({ status: 201, description: 'Portefeuille créé avec succès' })
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer le portefeuille d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Portefeuille de l\'utilisateur' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé' })
  findByUser(@Param('userId') userId: string) {
    return this.walletsService.findByUser(userId);
  }

  @Get('user/:userId/balance')
  @ApiOperation({ summary: 'Récupérer le solde d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Solde du portefeuille' })
  getBalance(@Param('userId') userId: string) {
    return this.walletsService.getBalance(userId);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques du portefeuille' })
  @ApiResponse({ status: 200, description: 'Statistiques du portefeuille' })
  getStats(@Param('userId') userId: string) {
    return this.walletsService.getWalletStats(userId);
  }

  @Get('user/:userId/transactions')
  @ApiOperation({ summary: 'Récupérer l\'historique des transactions' })
  @ApiResponse({ status: 200, description: 'Historique des transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  getTransactionHistory(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('type') type?: TransactionType,
  ) {
    return this.walletsService.getTransactionHistory(userId, page, limit, type);
  }

  @Post('user/:userId/add-funds')
  @ApiOperation({ summary: 'Ajouter des fonds au portefeuille' })
  @ApiResponse({ status: 200, description: 'Fonds ajoutés avec succès' })
  addFunds(@Param('userId') userId: string, @Body() addFundsDto: AddFundsDto) {
    return this.walletsService.addFunds(userId, addFundsDto);
  }

  @Post('user/:userId/withdraw')
  @ApiOperation({ summary: 'Retirer des fonds du portefeuille' })
  @ApiResponse({ status: 200, description: 'Fonds retirés avec succès' })
  withdrawFunds(@Param('userId') userId: string, @Body() withdrawFundsDto: WithdrawFundsDto) {
    return this.walletsService.withdrawFunds(userId, withdrawFundsDto);
  }

  @Post('user/:userId/refund')
  @ApiOperation({ summary: 'Rembourser dans le portefeuille' })
  @ApiResponse({ status: 200, description: 'Remboursement effectué' })
  refund(
    @Param('userId') userId: string,
    @Body() data: { amount: number; originalPaymentId: string; reason?: string }
  ) {
    return this.walletsService.refund(userId, data.amount, data.originalPaymentId, data.reason);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transférer des fonds entre portefeuilles' })
  @ApiResponse({ status: 200, description: 'Transfert effectué avec succès' })
  transferFunds(@Body() transferFundsDto: TransferFundsDto) {
    return this.walletsService.transferFunds(transferFundsDto);
  }

  @Patch('user/:userId/block')
  @ApiOperation({ summary: 'Bloquer un portefeuille' })
  @ApiResponse({ status: 200, description: 'Portefeuille bloqué' })
  blockWallet(@Param('userId') userId: string, @Body() data: { reason: string }) {
    return this.walletsService.blockWallet(userId, data.reason);
  }

  @Patch('user/:userId/unblock')
  @ApiOperation({ summary: 'Débloquer un portefeuille' })
  @ApiResponse({ status: 200, description: 'Portefeuille débloqué' })
  unblockWallet(@Param('userId') userId: string) {
    return this.walletsService.unblockWallet(userId);
  }

  @Patch('user/:userId/limits')
  @ApiOperation({ summary: 'Mettre à jour les limites de dépenses' })
  @ApiResponse({ status: 200, description: 'Limites mises à jour' })
  updateSpendingLimits(
    @Param('userId') userId: string,
    @Body() limits: {
      maxBalance?: number;
      maxDailySpending?: number;
      maxMonthlySpending?: number;
    }
  ) {
    return this.walletsService.updateSpendingLimits(userId, limits);
  }
}
