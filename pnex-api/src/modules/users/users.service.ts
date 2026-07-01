import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const update: any = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.avatar !== undefined) update.avatar = dto.avatar;
    if (dto.handle !== undefined) {
      const existing = await this.userModel.findOne({ handle: dto.handle, _id: { $ne: userId } }).lean();
      if (existing) throw new NotFoundException('Handle already taken');
      update.handle = dto.handle;
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async findUsers(query?: string): Promise<UserResponseDto[]> {
    const filter: any = { isActive: true };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { handle: { $regex: query, $options: 'i' } },
      ];
    }
    const users = await this.userModel
      .find(filter)
      .sort({ totalTrades: -1 })
      .limit(50)
      .lean();
    return users.map((u) => this.toResponse(u));
  }

  async getLeaderboard(): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ isActive: true })
      .sort({ totalVolume: -1 })
      .limit(20)
      .lean();
    return users.map((u) => this.toResponse(u));
  }

  private toResponse(user: any): UserResponseDto {
    return {
      _id: user._id.toString(),
      phone: user.phone || '',
      name: user.name || null,
      handle: user.handle || null,
      memberNo: user.memberNo,
      avatar: user.avatar || null,
      tier: user.tier || 'TRUSTED',
      trustScore: user.trustScore || 0,
      tradeLimit: user.tradeLimit || 0,
      totalTrades: user.totalTrades || 0,
      totalVolume: user.totalVolume || 0,
      connections: user.connections || 0,
      inviteQuota: user.inviteQuota || { total: 5, used: 0 },
      isOnboarded: user.isOnboarded || false,
      createdAt: user.createdAt,
    };
  }
}
