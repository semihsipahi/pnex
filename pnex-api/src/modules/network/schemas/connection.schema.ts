import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConnectionDocument = Connection & Document;

export enum ConnectionStatus {
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

@Schema({ timestamps: true, collection: 'connections' })
export class Connection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: ConnectionStatus, default: ConnectionStatus.PENDING })
  status: ConnectionStatus;

  @Prop({ default: 0, min: 0, max: 5 })
  trust: number;

  @Prop({ default: 0 })
  tradeLimit: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
ConnectionSchema.index({ requesterId: 1, targetId: 1 }, { unique: true });
ConnectionSchema.index({ targetId: 1, status: 1 });
