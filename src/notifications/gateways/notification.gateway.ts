import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from '../services/notifications.service';
import { NotificationType } from '../schemas/notification.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('NotificationGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
    this.logger.log('NotificationGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('user:connect')
  async handleUserConnect(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { userId } = data;
      this.connectedUsers.set(client.id, userId);
      
      // Rejoindre la room de l'utilisateur
      client.join(`user:${userId}`);
      
      // Envoyer le nombre de notifications non lues
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('notifications:unread:count', { count: unreadCount });
      
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      return { success: true, message: 'Connecté avec succès' };
    } catch (error) {
      this.logger.error('Erreur lors de la connexion de l\'utilisateur:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  @SubscribeMessage('notification:mark:read')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { success: false, message: 'Utilisateur non identifié' };
      }

      await this.notificationsService.markAsRead(data.notificationId);
      
      // Mettre à jour le compteur de notifications non lues
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('notifications:unread:count', { count: unreadCount });

      return { success: true, message: 'Notification marquée comme lue' };
    } catch (error) {
      this.logger.error('Erreur lors du marquage de la notification:', error);
      return { success: false, message: 'Erreur lors du marquage' };
    }
  }

  @SubscribeMessage('notifications:mark:all:read')
  async handleMarkAllAsRead(
    @MessageBody() data: {},
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { success: false, message: 'Utilisateur non identifié' };
      }

      await this.notificationsService.markAllAsRead(userId);
      
      // Mettre à jour le compteur de notifications non lues
      client.emit('notifications:unread:count', { count: 0 });

      return { success: true, message: 'Toutes les notifications marquées comme lues' };
    } catch (error) {
      this.logger.error('Erreur lors du marquage de toutes les notifications:', error);
      return { success: false, message: 'Erreur lors du marquage' };
    }
  }

  @SubscribeMessage('notifications:get:unread:count')
  async handleGetUnreadCount(
    @MessageBody() data: {},
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { success: false, message: 'Utilisateur non identifié' };
      }

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('notifications:unread:count', { count: unreadCount });

      return { success: true, count: unreadCount };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du compteur:', error);
      return { success: false, message: 'Erreur lors de la récupération' };
    }
  }

  // Méthodes pour émettre des notifications depuis d'autres services
  async sendNotificationToUser(userId: string, notification: any) {
    // Envoyer la notification en temps réel
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    
    // Mettre à jour le compteur de notifications non lues
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('notifications:unread:count', { count: unreadCount });
  }

  async sendBulkNotification(userIds: string[], notification: any) {
    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
      
      // Mettre à jour le compteur pour chaque utilisateur
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      this.server.to(`user:${userId}`).emit('notifications:unread:count', { count: unreadCount });
    }
  }

  async sendRideNotification(userId: string, type: NotificationType, data: any) {
    this.server.to(`user:${userId}`).emit('notification:ride', {
      type,
      data,
      timestamp: new Date(),
    });
  }

  async sendPaymentNotification(userId: string, type: NotificationType, data: any) {
    this.server.to(`user:${userId}`).emit('notification:payment', {
      type,
      data,
      timestamp: new Date(),
    });
  }

  async sendSystemNotification(userIds: string[], message: string, data?: any) {
    const notification = {
      type: NotificationType.SYSTEM_UPDATE,
      message,
      data,
      timestamp: new Date(),
    };

    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit('notification:system', notification);
    }
  }

  // Événements spécifiques pour les courses
  emitRideRequest(driverId: string, rideData: any) {
    this.server.to(`user:${driverId}`).emit('ride:request', rideData);
  }

  emitRideAccepted(customerId: string, rideData: any) {
    this.server.to(`user:${customerId}`).emit('ride:accepted', rideData);
  }

  emitRideStarted(customerId: string, rideData: any) {
    this.server.to(`user:${customerId}`).emit('ride:started', rideData);
  }

  emitRideCompleted(userId: string, rideData: any) {
    this.server.to(`user:${userId}`).emit('ride:completed', rideData);
  }

  emitDriverArrived(customerId: string, driverData: any) {
    this.server.to(`user:${customerId}`).emit('driver:arrived', driverData);
  }
}
