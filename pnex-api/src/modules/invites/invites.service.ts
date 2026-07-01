import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InviteCode, InviteCodeDocument, InviteCodeStatus } from './schemas/invite-code.schema';
import { Waitlist, WaitlistDocument, WaitlistStatus } from './schemas/waitlist.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { Types } from 'mongoose';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(InviteCode.name)
    private inviteCodeModel: Model<InviteCodeDocument>,
    @InjectModel(Waitlist.name)
    private waitlistModel: Model<WaitlistDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async verifyInvite(dto: VerifyInviteDto): Promise<{ valid: boolean; message: string }> {
    const code = dto.code.toUpperCase().trim();
    const invite = await this.inviteCodeModel.findOne({ code, status: InviteCodeStatus.ACTIVE }).lean();

    if (!invite) {
      return { valid: false, message: 'Invalid or expired invitation code. Please check or join the waitlist.' };
    }

    return { valid: true, message: 'Invitation code is valid. Proceed with verification.' };
  }

  async useInviteCode(code: string, userId: string): Promise<void> {
    const normalizedCode = code.toUpperCase().trim();
    const invite = await this.inviteCodeModel.findOne({
      code: normalizedCode,
      status: InviteCodeStatus.ACTIVE,
    }).lean();

    if (!invite) {
      throw new BadRequestException('Invalid or expired invitation code');
    }

    if (invite.usedBy) {
      throw new BadRequestException('This invitation code has already been used');
    }

    await this.inviteCodeModel.updateOne(
      { _id: invite._id },
      {
        $set: {
          status: InviteCodeStatus.USED,
          usedBy: new Types.ObjectId(userId),
          usedAt: new Date(),
        },
      },
    );

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { isOnboarded: true } },
    );
  }

  async getMyInviteCodes(userId: string): Promise<any[]> {
    const codes = await this.inviteCodeModel
      .find({ creatorId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return codes.map((c) => ({
      code: c.code,
      status: c.status,
      usedAt: c.usedAt,
      createdAt: c.createdAt,
    }));
  }

  async generateInviteCode(userId: string): Promise<{ code: string }> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    if (user.inviteQuota.used >= user.inviteQuota.total) {
      throw new ForbiddenException('You have used all your invitation quota');
    }

    const code = this.generateCode();
    await this.inviteCodeModel.create({
      code,
      creatorId: new Types.ObjectId(userId),
    });

    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { 'inviteQuota.used': 1 } },
    );

    return { code };
  }

  async joinWaitlist(dto: JoinWaitlistDto): Promise<{ message: string }> {
    const existing = await this.waitlistModel.findOne({ phone: dto.phone }).lean();
    if (existing) {
      throw new ConflictException('This phone number is already on the waitlist');
    }

    const registered = await this.userModel.findOne({ phone: dto.phone }).lean();
    if (registered) {
      throw new ConflictException('This phone number is already registered');
    }

    await this.waitlistModel.create({
      phone: dto.phone,
      status: WaitlistStatus.WAITING,
    });

    return { message: 'Successfully joined the waitlist' };
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Math.floor(10 + Math.random() * 90).toString();
    return `PNEX-${part1}-${part3}`;
  }
}
