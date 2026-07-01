import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { DealsGateway } from './deals.gateway';
import { Deal, DealSchema } from './schemas/deal.schema';
import { Offer, OfferSchema } from '../offers/schemas/offer.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DealsController],
  providers: [DealsService, DealsGateway],
  exports: [DealsService, DealsGateway],
})
export class DealsModule {}
