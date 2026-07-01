import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import appConfig from '../../config/app.config';
import jwtConfig from '../../config/jwt.config';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InviteCode, InviteCodeDocument, InviteCodeStatus } from '../invites/schemas/invite-code.schema';
import { Waitlist, WaitlistDocument, WaitlistStatus } from '../invites/schemas/waitlist.schema';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CheckPhoneDto } from './dto/check-phone.dto';
import { RegisterWithInviteDto } from './dto/register-with-invite.dto';
import { ApproveWaitlistDto } from './dto/approve-waitlist.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(appConfig.KEY)
    private appCfg: ConfigType<typeof appConfig>,
    @Inject(jwtConfig.KEY)
    private jwtCfg: ConfigType<typeof jwtConfig>,
    private jwtService: JwtService,
    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(InviteCode.name)
    private inviteCodeModel: Model<InviteCodeDocument>,
    @InjectModel(Waitlist.name)
    private waitlistModel: Model<WaitlistDocument>,
  ) {}

  async checkPhone(dto: CheckPhoneDto): Promise<{ status: string; message?: string }> {
    const { phone } = dto;

    const user = await this.userModel.findOne({ phone, isActive: true }).lean();
    if (user) {
      return { status: 'registered' };
    }

    const waitlistEntry = await this.waitlistModel.findOne({ phone, status: WaitlistStatus.WAITING }).lean();
    if (waitlistEntry) {
      return {
        status: 'waitlisted',
        message: 'Your application is pending approval. You will be notified when granted access.',
      };
    }

    return { status: 'new' };
  }

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const { phone } = dto;

    const user = await this.userModel.findOne({ phone, isActive: true }).lean();
    if (!user) {
      throw new BadRequestException('This phone number is not registered. Please use an invitation code.');
    }

    await this.otpModel.updateMany(
      { phone, verified: false },
      { $set: { expiresAt: new Date(0) } },
    );

    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + this.appCfg.otpExpiresInSeconds * 1000);

    await this.otpModel.create({
      phone,
      code: hashedCode,
      expiresAt,
    });

    this.logger.log(`OTP sent to ${phone}: ${code}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<Record<string, any>> {
    const { phone, code } = dto;

    const user = await this.userModel.findOne({ phone, isActive: true }).lean();
    if (!user) {
      throw new UnauthorizedException('User not found. Please register with an invitation code.');
    }

    const recentOtps = await this.otpModel
      .find({ phone, verified: false })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    if (recentOtps.length === 0) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    const latestOtp = recentOtps[0];

    if (latestOtp.attempts >= this.appCfg.otpMaxAttempts) {
      throw new BadRequestException('Maximum OTP attempts exceeded. Request a new code.');
    }

    if (new Date() > latestOtp.expiresAt) {
      throw new BadRequestException('OTP has expired. Request a new code.');
    }

    const isValid = await bcrypt.compare(code, latestOtp.code);
    if (!isValid) {
      await this.otpModel.updateOne(
        { _id: latestOtp._id },
        { $inc: { attempts: 1 } },
      );
      throw new BadRequestException('Invalid OTP code');
    }

    await this.otpModel.updateOne(
      { _id: latestOtp._id },
      { $set: { verified: true } },
    );

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } },
    );

    const tokens = this.generateTokens(user._id.toString(), user.phone);
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: tokens.refreshToken } },
    );

    const updatedUser = await this.userModel.findById(user._id).lean();
    return this.toUserResponse(updatedUser, tokens);
  }

  async registerWithInvite(dto: RegisterWithInviteDto): Promise<Record<string, any>> {
    const { phone, code, name, handle } = dto;

    const existingUser = await this.userModel.findOne({ phone }).lean();
    if (existingUser) {
      throw new BadRequestException('This phone number is already registered. Please log in.');
    }

    const waitlistEntry = await this.waitlistModel.findOne({ phone }).lean();
    if (waitlistEntry) {
      throw new BadRequestException('This phone number is on the waitlist. Please wait for approval.');
    }

    const normalizedCode = code.toUpperCase().trim();
    const invite = await this.inviteCodeModel.findOne({
      code: normalizedCode,
      status: InviteCodeStatus.ACTIVE,
    }).lean();

    if (!invite) {
      throw new BadRequestException('Invalid or expired invitation code.');
    }

    if (invite.usedBy) {
      throw new BadRequestException('This invitation code has already been used.');
    }

    if (handle) {
      const handleExists = await this.userModel.findOne({ handle }).lean();
      if (handleExists) {
        throw new BadRequestException('This username is already taken.');
      }
    }

    const memberNo = await this.getNextMemberNo();
    const user = await this.userModel.create({
      phone,
      name: name || null,
      handle: handle || null,
      memberNo,
      tier: 'TRUSTED',
      isActive: true,
      isOnboarded: true,
      lastLoginAt: new Date(),
    });

    await this.inviteCodeModel.updateOne(
      { _id: invite._id },
      {
        $set: {
          status: InviteCodeStatus.USED,
          usedBy: user._id,
          usedAt: new Date(),
        },
      },
    );

    await this.userModel.updateOne(
      { _id: invite.creatorId },
      { $inc: { 'inviteQuota.used': 1 } },
    );

    const tokens = this.generateTokens(user._id.toString(), user.phone);
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: tokens.refreshToken } },
    );

    return this.toUserResponse(user.toObject(), tokens);
  }

  async approveWaitlist(dto: ApproveWaitlistDto): Promise<Record<string, any>> {
    const { phone } = dto;

    const waitlistEntry = await this.waitlistModel.findOne({ phone, status: WaitlistStatus.WAITING }).lean();
    if (!waitlistEntry) {
      throw new NotFoundException('Phone number not found on waitlist.');
    }

    const existingUser = await this.userModel.findOne({ phone }).lean();
    if (existingUser) {
      throw new BadRequestException('This phone number is already a user.');
    }

    const memberNo = await this.getNextMemberNo();
    const user = await this.userModel.create({
      phone,
      memberNo,
      isActive: true,
      isOnboarded: true,
      tier: 'TRUSTED',
    });

    await this.waitlistModel.updateOne(
      { _id: waitlistEntry._id },
      { $set: { status: WaitlistStatus.INVITED } },
    );

    return {
      message: 'User approved and moved from waitlist to active users.',
      user: {
        _id: user._id.toString(),
        phone: user.phone,
        memberNo: user.memberNo,
        name: user.name,
        isActive: user.isActive,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<{ sub: string; phone: string }>(dto.refreshToken, {
        secret: this.jwtCfg.refreshSecret,
      });

      const user = await this.userModel.findById(payload.sub).lean();
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      if (user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException('Refresh token mismatch');
      }

      const tokens = this.generateTokens(user._id.toString(), user.phone);
      await this.userModel.updateOne(
        { _id: user._id },
        { $set: { refreshToken: tokens.refreshToken } },
      );

      return this.toUserResponse(user, tokens);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: null } },
    );
  }

  private generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtCfg.secret,
      expiresIn: this.jwtCfg.expiresIn as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtCfg.refreshSecret,
      expiresIn: this.jwtCfg.refreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  private generateOtpCode(): string {
    return '1111';
  }

  private async getNextMemberNo(): Promise<number> {
    const lastUser = await this.userModel
      .findOne({})
      .sort({ memberNo: -1 })
      .select('memberNo')
      .lean();
    return (lastUser?.memberNo || 0) + 1;
  }

  private toUserResponse(user: any, tokens?: { accessToken: string; refreshToken: string }): Record<string, any> {
    return {
      _id: user._id.toString(),
      phone: user.phone,
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
      ...(tokens ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } : {}),
    };
  }
}
