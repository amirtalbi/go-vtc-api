import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationStatus, NotificationType } from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async findAll(): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find()
      .populate('userId', 'firstname lastname email')
      .populate('relatedRideId')
      .populate('relatedPaymentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{
    notifications: NotificationDocument[];
    total: number;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .populate('relatedRideId')
        .populate('relatedPaymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId }),
      this.notificationModel.countDocuments({ 
        userId, 
        status: { $ne: NotificationStatus.READ } 
      }),
    ]);

    return { notifications, total, unreadCount };
  }

  async findOne(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('userId', 'firstname lastname email')
      .populate('relatedRideId')
      .populate('relatedPaymentId')
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .populate('userId', 'firstname lastname email')
      .populate('relatedRideId')
      .populate('relatedPaymentId')
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return notification;
  }

  async markAsRead(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        id,
        { 
          status: NotificationStatus.READ,
          readAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      )
      .populate('userId', 'firstname lastname email')
      .populate('relatedRideId')
      .populate('relatedPaymentId')
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { 
        userId, 
        status: { $ne: NotificationStatus.READ } 
      },
      { 
        status: NotificationStatus.READ,
        readAt: new Date(),
        updatedAt: new Date()
      }
    ).exec();
  }

  async markAsDelivered(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        id,
        { 
          status: NotificationStatus.DELIVERED,
          deliveredAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      )
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ 
      userId, 
      status: { $ne: NotificationStatus.READ } 
    });
  }

  async getNotificationsByType(type: NotificationType, userId?: string): Promise<NotificationDocument[]> {
    const filter: any = { type };
    if (userId) {
      filter.userId = userId;
    }

    return this.notificationModel
      .find(filter)
      .populate('userId', 'firstname lastname email')
      .populate('relatedRideId')
      .populate('relatedPaymentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async sendRideNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    rideId?: string,
    additionalData?: Record<string, any>
  ): Promise<NotificationDocument> {
    const notificationData: CreateNotificationDto = {
      userId,
      type,
      title,
      message,
      relatedRideId: rideId,
      data: additionalData,
    };

    return this.create(notificationData);
  }

  async sendPaymentNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    paymentId?: string,
    additionalData?: Record<string, any>
  ): Promise<NotificationDocument> {
    const notificationData: CreateNotificationDto = {
      userId,
      type,
      title,
      message,
      relatedPaymentId: paymentId,
      data: additionalData,
    };

    return this.create(notificationData);
  }

  async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    additionalData?: Record<string, any>
  ): Promise<NotificationDocument[]> {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      data: additionalData,
    }));

    const result = await this.notificationModel.insertMany(notifications);
    return result as unknown as NotificationDocument[];
  }

  async cleanupExpiredNotifications(): Promise<void> {
    await this.notificationModel.deleteMany({
      expiresAt: { $lt: new Date() }
    }).exec();
  }

  async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: NotificationStatus.READ
    }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }
  }

  async removeByUser(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId }).exec();
  }
}
