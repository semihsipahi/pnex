import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WaitlistDocument = Waitlist & Document;

export enum WaitlistStatus {
  WAITING = 'WAITING',
  INVITED = 'INVITED',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true, collection: 'waitlist' })
export class Waitlist {
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ type: String, enum: WaitlistStatus, default: WaitlistStatus.WAITING })
  status: WaitlistStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const WaitlistSchema = SchemaFactory.createForClass(Waitlist);
