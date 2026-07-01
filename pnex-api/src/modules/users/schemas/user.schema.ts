import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserTier {
  FOUNDING = 'FOUNDING',
  INNER = 'INNER',
  TRUSTED = 'TRUSTED',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  PLATINUM = 'PLATINUM',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null, unique: true, sparse: true })
  handle: string;

  @Prop({ unique: true, index: true })
  memberNo: number;

  @Prop({ default: null })
  avatar: string;

  @Prop({ type: String, enum: UserTier, default: UserTier.TRUSTED })
  tier: UserTier;

  @Prop({ default: 0, min: 0, max: 5 })
  trustScore: number;

  @Prop({ default: 0 })
  tradeLimit: number;

  @Prop({ default: 0 })
  totalTrades: number;

  @Prop({ default: 0 })
  totalVolume: number;

  @Prop({ default: 0 })
  connections: number;

  @Prop({ type: Object, default: { total: 5, used: 0 } })
  inviteQuota: { total: number; used: number };

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  isOnboarded: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
