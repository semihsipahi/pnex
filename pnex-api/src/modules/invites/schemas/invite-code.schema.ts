import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InviteCodeDocument = InviteCode & Document;

export enum InviteCodeStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  REVOKED = 'REVOKED',
}

@Schema({ timestamps: true, collection: 'invite_codes' })
export class InviteCode {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usedBy: Types.ObjectId | null;

  @Prop({ type: String, enum: InviteCodeStatus, default: InviteCodeStatus.ACTIVE })
  status: InviteCodeStatus;

  @Prop({ type: Date, default: null })
  usedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode);
