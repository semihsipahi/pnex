import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TradeRequestDocument = TradeRequest & Document;

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'trade_requests' })
export class TradeRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  fromUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  toUserId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  metal: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: '' })
  message: string;

  @Prop({ type: String, default: RequestStatus.PENDING })
  status: RequestStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const TradeRequestSchema = SchemaFactory.createForClass(TradeRequest);
TradeRequestSchema.index({ fromUserId: 1, status: 1 });
TradeRequestSchema.index({ toUserId: 1, status: 1 });
