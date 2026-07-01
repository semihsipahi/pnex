import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DealDocument = Deal & Document;

export enum DealType {
  SELL = 'SELL',
  BUY = 'BUY',
}

export enum MetalType {
  HAS = 'has',
  TWENTY_TWO_AYAR = '22ayar',
  USD = 'usd',
  EUR = 'eur',
}

export enum DealStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'deals' })
export class Deal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creatorId: Types.ObjectId;

  @Prop({ type: String, enum: DealType, required: true })
  type: DealType;

  @Prop({ type: String, enum: MetalType, required: true })
  metal: MetalType;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Number, default: null })
  minPrice: number | null;

  @Prop({ type: Number, default: null })
  maxPrice: number | null;

  @Prop({ type: String, enum: DealStatus, default: DealStatus.ACTIVE })
  status: DealStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  winnerId: Types.ObjectId | null;

  @Prop({ default: 0 })
  offerCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const DealSchema = SchemaFactory.createForClass(Deal);
DealSchema.index({ status: 1, createdAt: -1 });
DealSchema.index({ creatorId: 1, status: 1 });
