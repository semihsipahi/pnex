import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Connection, ConnectionDocument, ConnectionStatus } from './schemas/connection.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class NetworkService {
  constructor(
    @InjectModel(Connection.name)
    private connectionModel: Model<ConnectionDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getConnections(userId: string) {
    const connections = await this.connectionModel
      .find({
        $or: [
          { requesterId: new Types.ObjectId(userId), status: ConnectionStatus.CONNECTED },
          { targetId: new Types.ObjectId(userId), status: ConnectionStatus.CONNECTED },
        ],
      })
      .populate('requesterId', 'name handle avatar trustScore memberNo')
      .populate('targetId', 'name handle avatar trustScore memberNo')
      .lean();

    return connections.map((c: any) => {
      const otherUser = c.requesterId._id.toString() === userId ? c.targetId : c.requesterId;
      return {
        id: c._id.toString(),
        user: {
          id: otherUser._id.toString(),
          name: otherUser.name,
          handle: otherUser.handle,
          avatar: otherUser.avatar,
          memberNo: otherUser.memberNo,
          trustScore: otherUser.trustScore,
        },
        trust: c.trust,
        tradeLimit: c.tradeLimit,
        createdAt: c.createdAt,
      };
    });
  }

  async getPendingRequests(userId: string) {
    const requests = await this.connectionModel
      .find({
        targetId: new Types.ObjectId(userId),
        status: ConnectionStatus.PENDING,
      })
      .populate('requesterId', 'name handle avatar trustScore memberNo')
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((r: any) => ({
      id: r._id.toString(),
      from: {
        id: r.requesterId._id.toString(),
        name: r.requesterId.name,
        handle: r.requesterId.handle,
        avatar: r.requesterId.avatar,
        memberNo: r.requesterId.memberNo,
      },
      createdAt: r.createdAt,
    }));
  }

  async getMembers(query?: string) {
    const filter: any = { isActive: true };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { handle: { $regex: query, $options: 'i' } },
      ];
    }
    const members = await this.userModel
      .find(filter)
      .select('name handle avatar trustScore tradeLimit totalTrades totalVolume connections tier memberNo')
      .sort({ totalTrades: -1 })
      .limit(100)
      .lean();

    return members.map((m: any) => ({
      id: m._id.toString(),
      name: m.name,
      handle: m.handle,
      avatar: m.avatar,
      memberNo: m.memberNo,
      tier: m.tier,
      trustScore: m.trustScore,
      tradeLimit: m.tradeLimit,
      totalTrades: m.totalTrades,
      connections: m.connections,
    }));
  }

  async sendConnectionRequest(userId: string, targetId: string) {
    if (userId === targetId) throw new BadRequestException('Cannot connect with yourself');

    const target = await this.userModel.findById(targetId).lean();
    if (!target) throw new NotFoundException('Target user not found');

    const existing = await this.connectionModel.findOne({
      $or: [
        { requesterId: new Types.ObjectId(userId), targetId: new Types.ObjectId(targetId) },
        { requesterId: new Types.ObjectId(targetId), targetId: new Types.ObjectId(userId) },
      ],
    }).lean();

    if (existing) {
      if (existing.status === ConnectionStatus.CONNECTED) {
        throw new BadRequestException('Already connected');
      }
      throw new BadRequestException('Connection request already sent');
    }

    const connection = await this.connectionModel.create({
      requesterId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      status: ConnectionStatus.PENDING,
    });

    return {
      message: 'Connection request sent',
      id: connection._id.toString(),
    };
  }

  async respondToConnection(userId: string, connectionId: string, action: 'accept' | 'reject') {
    const connection = await this.connectionModel.findById(connectionId).lean();
    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.targetId.toString() !== userId) throw new BadRequestException('Not your request');

    const status = action === 'accept' ? ConnectionStatus.CONNECTED : ConnectionStatus.REJECTED;

    if (status === ConnectionStatus.CONNECTED) {
      await Promise.all([
        this.connectionModel.updateOne({ _id: connectionId }, { $set: { status } }),
        this.userModel.updateOne({ _id: connection.requesterId }, { $inc: { connections: 1 } }),
        this.userModel.updateOne({ _id: connection.targetId }, { $inc: { connections: 1 } }),
      ]);
    } else {
      await this.connectionModel.updateOne({ _id: connectionId }, { $set: { status } });
    }

    return { message: `Connection ${action === 'accept' ? 'accepted' : 'rejected'}` };
  }
}
