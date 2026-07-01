import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async getNotifications(userId: string) {
    const notifications = await this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });

    return {
      data: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationModel.updateOne(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { $set: { read: true } },
    );
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { $set: { read: true } },
    );
    return { message: 'All notifications marked as read' };
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body?: string,
    data?: Record<string, unknown>,
  ) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      data,
    });
  }
}
