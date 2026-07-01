import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TradeRequest,
  TradeRequestDocument,
  RequestStatus,
} from './schemas/trade-request.schema';
import { CreateTradeRequestDto } from './dto/create-trade-request.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class TradeRequestsService {
  constructor(
    @InjectModel(TradeRequest.name)
    private tradeRequestModel: Model<TradeRequestDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async sendRequest(userId: string, dto: CreateTradeRequestDto) {
    if (userId === dto.toUserId) throw new BadRequestException('Cannot send request to yourself');

    const target = await this.userModel.findById(dto.toUserId).lean();
    if (!target) throw new NotFoundException('Target user not found');

    const request = await this.tradeRequestModel.create({
      fromUserId: new Types.ObjectId(userId),
      toUserId: new Types.ObjectId(dto.toUserId),
      type: dto.type,
      metal: dto.metal,
      amount: dto.amount,
      message: dto.message,
      status: RequestStatus.PENDING,
    });

    const populated = await this.tradeRequestModel.findById(request._id)
      .populate('fromUserId', 'name handle avatar')
      .lean() as any;

    return {
      id: populated._id.toString(),
      from: {
        id: populated.fromUserId._id.toString(),
        name: populated.fromUserId.name,
        handle: populated.fromUserId.handle,
        avatar: populated.fromUserId.avatar,
      },
      type: populated.type,
      metal: populated.metal,
      amount: populated.amount,
      message: populated.message,
      status: populated.status,
      createdAt: populated.createdAt,
    };
  }

  async getIncomingRequests(userId: string) {
    const requests = await this.tradeRequestModel
      .find({ toUserId: new Types.ObjectId(userId) })
      .populate('fromUserId', 'name handle avatar trustScore')
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((r: any) => ({
      id: r._id.toString(),
      from: {
        id: r.fromUserId._id.toString(),
        name: r.fromUserId.name,
        handle: r.fromUserId.handle,
        avatar: r.fromUserId.avatar,
      },
      type: r.type,
      metal: r.metal,
      amount: r.amount,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async getOutgoingRequests(userId: string) {
    const requests = await this.tradeRequestModel
      .find({ fromUserId: new Types.ObjectId(userId) })
      .populate('toUserId', 'name handle avatar')
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((r: any) => ({
      id: r._id.toString(),
      to: {
        id: r.toUserId._id.toString(),
        name: r.toUserId.name,
        handle: r.toUserId.handle,
        avatar: r.toUserId.avatar,
      },
      type: r.type,
      metal: r.metal,
      amount: r.amount,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async respondToRequest(userId: string, requestId: string, action: 'approve' | 'reject') {
    const request = await this.tradeRequestModel.findById(requestId).lean();
    if (!request) throw new NotFoundException('Trade request not found');
    if (request.toUserId.toString() !== userId) throw new BadRequestException('Not your request');
    if (request.status !== RequestStatus.PENDING) throw new BadRequestException('Request already responded');

    const status = action === 'approve' ? RequestStatus.APPROVED : RequestStatus.REJECTED;

    await this.tradeRequestModel.updateOne(
      { _id: requestId },
      { $set: { status } },
    );

    return { message: `Trade request ${action === 'approve' ? 'approved' : 'rejected'}` };
  }
}
