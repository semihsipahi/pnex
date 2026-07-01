import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeRequestsController } from './trade-requests.controller';
import { TradeRequestsService } from './trade-requests.service';
import { TradeRequest, TradeRequestSchema } from './schemas/trade-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TradeRequest.name, schema: TradeRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TradeRequestsController],
  providers: [TradeRequestsService],
  exports: [TradeRequestsService],
})
export class TradeRequestsModule {}
