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
import { LocationService } from '../services/location.service';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { LocationStatus } from '../schemas/location.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/location',
})
export class LocationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('LocationGateway');
  private connectedDrivers = new Map<string, string>(); // socketId -> driverId

  constructor(private readonly locationService: LocationService) {}

  afterInit(server: Server) {
    this.logger.log('LocationGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const driverId = this.connectedDrivers.get(client.id);
    if (driverId) {
      try {
        // Marquer le conducteur comme hors ligne
        await this.locationService.setDriverStatus(driverId, LocationStatus.OFFLINE);
        this.connectedDrivers.delete(client.id);
        
        // Notifier les autres clients que ce conducteur est hors ligne
        this.server.emit('driver:offline', { driverId });
      } catch (error) {
        this.logger.error(`Erreur lors de la déconnexion du conducteur ${driverId}:`, error);
      }
    }
  }

  @SubscribeMessage('driver:connect')
  async handleDriverConnect(
    @MessageBody() data: { driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { driverId } = data;
      this.connectedDrivers.set(client.id, driverId);
      
      // Rejoindre la room du conducteur
      client.join(`driver:${driverId}`);
      
      this.logger.log(`Conducteur ${driverId} connecté avec socket ${client.id}`);
      
      return { success: true, message: 'Connecté avec succès' };
    } catch (error) {
      this.logger.error('Erreur lors de la connexion du conducteur:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @MessageBody() updateLocationDto: UpdateLocationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const driverId = this.connectedDrivers.get(client.id);
      if (!driverId) {
        return { success: false, message: 'Conducteur non identifié' };
      }

      const location = await this.locationService.updateDriverLocation(driverId, updateLocationDto);
      
      // Émettre la mise à jour à tous les clients intéressés
      this.server.emit('location:updated', {
        driverId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          status: location.status,
          lastUpdate: location.lastUpdate,
        },
      });

      return { success: true, location };
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour de localisation:', error);
      return { success: false, message: 'Erreur de mise à jour' };
    }
  }

  @SubscribeMessage('driver:status')
  async handleDriverStatusUpdate(
    @MessageBody() data: { status: LocationStatus; currentRideId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const driverId = this.connectedDrivers.get(client.id);
      if (!driverId) {
        return { success: false, message: 'Conducteur non identifié' };
      }

      const location = await this.locationService.setDriverStatus(
        driverId, 
        data.status, 
        data.currentRideId
      );

      // Notifier les changements de statut
      this.server.emit('driver:status:changed', {
        driverId,
        status: location.status,
        currentRideId: location.currentRideId,
      });

      return { success: true, location };
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, message: 'Erreur de mise à jour du statut' };
    }
  }

  @SubscribeMessage('location:track')
  handleTrackLocation(@MessageBody() data: { targetDriverId: string }, @ConnectedSocket() client: Socket) {
    // Permettre à un client (passager) de suivre la localisation d'un conducteur
    client.join(`track:${data.targetDriverId}`);
    return { success: true, message: `Suivi du conducteur ${data.targetDriverId} activé` };
  }

  @SubscribeMessage('location:untrack')
  handleUntrackLocation(@MessageBody() data: { targetDriverId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`track:${data.targetDriverId}`);
    return { success: true, message: `Suivi du conducteur ${data.targetDriverId} désactivé` };
  }

  // Méthodes pour émettre des événements depuis d'autres services
  emitLocationUpdate(driverId: string, location: any) {
    this.server.emit('location:updated', { driverId, location });
    this.server.to(`track:${driverId}`).emit('tracked:location:updated', { driverId, location });
  }

  emitDriverStatusChange(driverId: string, status: LocationStatus, currentRideId?: string) {
    this.server.emit('driver:status:changed', { driverId, status, currentRideId });
  }

  emitRideUpdate(rideId: string, driverId: string, location: any) {
    this.server.to(`ride:${rideId}`).emit('ride:location:updated', { 
      rideId, 
      driverId, 
      location 
    });
  }

  // Permettre aux passagers de rejoindre la room d'une course
  addClientToRide(clientId: string, rideId: string) {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.join(`ride:${rideId}`);
    }
  }

  removeClientFromRide(clientId: string, rideId: string) {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.leave(`ride:${rideId}`);
    }
  }
}
