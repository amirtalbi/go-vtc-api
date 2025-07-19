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
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationType } from '../schemas/notification.schema';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle notification' })
  @ApiResponse({ status: 201, description: 'Notification créée avec succès' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  @ApiResponse({ status: 200, description: 'Liste des notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Notifications de l\'utilisateur' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.notificationsService.findByUser(userId, page, limit);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Récupérer le nombre de notifications non lues' })
  @ApiResponse({ status: 200, description: 'Nombre de notifications non lues' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Récupérer les notifications par type' })
  @ApiResponse({ status: 200, description: 'Notifications du type spécifié' })
  findByType(
    @Param('type') type: NotificationType,
    @Query('userId') userId?: string,
  ) {
    return this.notificationsService.getNotificationsByType(type, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la notification' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une notification' })
  @ApiResponse({ status: 200, description: 'Notification mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/mark-all-read')
  @ApiOperation({ summary: 'Marquer toutes les notifications d\'un utilisateur comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues' })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/mark-delivered')
  @ApiOperation({ summary: 'Marquer une notification comme livrée' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme livrée' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markAsDelivered(@Param('id') id: string) {
    return this.notificationsService.markAsDelivered(id);
  }

  @Post('ride')
  @ApiOperation({ summary: 'Envoyer une notification liée à une course' })
  @ApiResponse({ status: 201, description: 'Notification de course envoyée' })
  sendRideNotification(@Body() data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    rideId?: string;
    additionalData?: Record<string, any>;
  }) {
    return this.notificationsService.sendRideNotification(
      data.userId,
      data.type,
      data.title,
      data.message,
      data.rideId,
      data.additionalData,
    );
  }

  @Post('payment')
  @ApiOperation({ summary: 'Envoyer une notification liée à un paiement' })
  @ApiResponse({ status: 201, description: 'Notification de paiement envoyée' })
  sendPaymentNotification(@Body() data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    paymentId?: string;
    additionalData?: Record<string, any>;
  }) {
    return this.notificationsService.sendPaymentNotification(
      data.userId,
      data.type,
      data.title,
      data.message,
      data.paymentId,
      data.additionalData,
    );
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Envoyer une notification à plusieurs utilisateurs' })
  @ApiResponse({ status: 201, description: 'Notifications envoyées en masse' })
  sendBulkNotification(@Body() data: {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    additionalData?: Record<string, any>;
  }) {
    return this.notificationsService.sendBulkNotification(
      data.userIds,
      data.type,
      data.title,
      data.message,
      data.additionalData,
    );
  }

  @Post('cleanup/expired')
  @ApiOperation({ summary: 'Nettoyer les notifications expirées' })
  @ApiResponse({ status: 200, description: 'Notifications expirées supprimées' })
  cleanupExpired() {
    return this.notificationsService.cleanupExpiredNotifications();
  }

  @Post('cleanup/old')
  @ApiOperation({ summary: 'Nettoyer les anciennes notifications' })
  @ApiResponse({ status: 200, description: 'Anciennes notifications supprimées' })
  cleanupOld(@Query('days', new ParseIntPipe({ optional: true })) days: number = 30) {
    return this.notificationsService.cleanupOldNotifications(days);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiResponse({ status: 200, description: 'Notification supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Supprimer toutes les notifications d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Notifications supprimées avec succès' })
  removeByUser(@Param('userId') userId: string) {
    return this.notificationsService.removeByUser(userId);
  }
}
