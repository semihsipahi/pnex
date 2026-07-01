import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

import { User, UserTier } from '../modules/users/schemas/user.schema';
import { InviteCode, InviteCodeStatus } from '../modules/invites/schemas/invite-code.schema';
import { Waitlist, WaitlistStatus } from '../modules/invites/schemas/waitlist.schema';
import { Deal, DealType, MetalType, DealStatus } from '../modules/deals/schemas/deal.schema';
import { Offer } from '../modules/offers/schemas/offer.schema';
import { Connection, ConnectionStatus } from '../modules/network/schemas/connection.schema';
import { TradeRequest, RequestStatus } from '../modules/trade-requests/schemas/trade-request.schema';
import { Notification } from '../modules/notifications/schemas/notification.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const UserModel = app.get<Model<User>>(getModelToken(User.name));
  const InviteCodeModel = app.get<Model<InviteCode>>(getModelToken(InviteCode.name));
  const WaitlistModel = app.get<Model<Waitlist>>(getModelToken(Waitlist.name));
  const DealModel = app.get<Model<Deal>>(getModelToken(Deal.name));
  const OfferModel = app.get<Model<Offer>>(getModelToken(Offer.name));
  const ConnectionModel = app.get<Model<Connection>>(getModelToken(Connection.name));
  const TradeRequestModel = app.get<Model<TradeRequest>>(getModelToken(TradeRequest.name));
  const NotificationModel = app.get<Model<Notification>>(getModelToken(Notification.name));
  const OtpModel = app.get<Model<any>>(getModelToken('Otp'));

  await Promise.all([
    UserModel.deleteMany({}),
    InviteCodeModel.deleteMany({}),
    WaitlistModel.deleteMany({}),
    DealModel.deleteMany({}),
    OfferModel.deleteMany({}),
    ConnectionModel.deleteMany({}),
    TradeRequestModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    OtpModel.deleteMany({}),
  ]);

  const users = await UserModel.create([
    {
      phone: '+905555555555',
      name: 'Alexander Mercer',
      handle: 'alex',
      memberNo: 1,
      tier: UserTier.FOUNDING,
      trustScore: 4.9,
      tradeLimit: 50000,
      totalTrades: 183,
      totalVolume: 2480000,
      connections: 48,
      inviteQuota: { total: 5, used: 3 },
      isActive: true,
      isOnboarded: true,
    },
    {
      phone: '+905550000001',
      name: 'Altinbaş Kuyumculuk',
      handle: 'altinbas',
      memberNo: 2,
      tier: UserTier.PLATINUM,
      trustScore: 4.8,
      tradeLimit: 100000,
      totalTrades: 312,
      totalVolume: 5200000,
      connections: 64,
      inviteQuota: { total: 5, used: 5 },
      isActive: true,
      isOnboarded: true,
    },
    {
      phone: '+905550000002',
      name: 'Demir Sarraf',
      handle: 'demirsarraf',
      memberNo: 3,
      tier: UserTier.GOLD,
      trustScore: 4.6,
      tradeLimit: 30000,
      totalTrades: 98,
      totalVolume: 890000,
      connections: 22,
      inviteQuota: { total: 5, used: 1 },
      isActive: true,
      isOnboarded: true,
    },
    {
      phone: '+905550000003',
      name: 'Kapalıçarşı Gold',
      handle: 'kgold',
      memberNo: 4,
      tier: UserTier.DIAMOND,
      trustScore: 4.7,
      tradeLimit: 75000,
      totalTrades: 156,
      totalVolume: 3100000,
      connections: 35,
      inviteQuota: { total: 5, used: 4 },
      isActive: true,
      isOnboarded: true,
    },
  ]);

  const [alex, altinbas, demir, kgold] = users;

  const inviteCodes = await InviteCodeModel.create([
    { code: 'PNEX-ABCD-12', creatorId: alex._id, status: InviteCodeStatus.ACTIVE },
    { code: 'PNEX-EFGH-34', creatorId: alex._id, status: InviteCodeStatus.USED, usedBy: demir._id, usedAt: new Date() },
    { code: 'PNEX-MAIN-01', creatorId: alex._id, status: InviteCodeStatus.ACTIVE },
  ]);

  const waitlistEntries = await WaitlistModel.create([
    { phone: '+905559999999', status: WaitlistStatus.WAITING },
  ]);

  const deals = await DealModel.create([
    {
      creatorId: altinbas._id,
      type: DealType.SELL,
      metal: MetalType.HAS,
      amount: 2500,
      minPrice: 3850,
      status: DealStatus.ACTIVE,
      offerCount: 3,
    },
    {
      creatorId: demir._id,
      type: DealType.SELL,
      metal: MetalType.TWENTY_TWO_AYAR,
      amount: 500,
      minPrice: 3720,
      status: DealStatus.ACTIVE,
      offerCount: 1,
    },
    {
      creatorId: kgold._id,
      type: DealType.BUY,
      metal: MetalType.HAS,
      amount: 1200,
      maxPrice: 3860,
      status: DealStatus.ACTIVE,
      offerCount: 7,
    },
    {
      creatorId: altinbas._id,
      type: DealType.SELL,
      metal: MetalType.HAS,
      amount: 750,
      minPrice: 3830,
      status: DealStatus.CLOSED,
      winnerId: demir._id,
      offerCount: 5,
    },
    {
      creatorId: alex._id,
      type: DealType.BUY,
      metal: MetalType.TWENTY_TWO_AYAR,
      amount: 3000,
      maxPrice: 3690,
      status: DealStatus.ACTIVE,
      offerCount: 2,
    },
  ]);

  const [deal1, deal2, deal3, deal4, deal5] = deals;

  const offers = await OfferModel.create([
    { dealId: deal1._id, userId: alex._id, price: 3860, status: 'PENDING' },
    { dealId: deal1._id, userId: demir._id, price: 3855, status: 'PENDING' },
    { dealId: deal1._id, userId: kgold._id, price: 3862, status: 'PENDING' },
    { dealId: deal4._id, userId: demir._id, price: 3840, status: 'ACCEPTED' },
    { dealId: deal4._id, userId: kgold._id, price: 3835, status: 'REJECTED' },
    { dealId: deal4._id, userId: alex._id, price: 3845, status: 'REJECTED' },
    { dealId: deal5._id, userId: altinbas._id, price: 3670, status: 'PENDING' },
    { dealId: deal5._id, userId: kgold._id, price: 3680, status: 'PENDING' },
  ]);

  const connections = await ConnectionModel.create([
    { requesterId: alex._id, targetId: altinbas._id, status: ConnectionStatus.CONNECTED, trust: 4.9, tradeLimit: 50000 },
    { requesterId: alex._id, targetId: demir._id, status: ConnectionStatus.CONNECTED, trust: 4.6, tradeLimit: 30000 },
    { requesterId: alex._id, targetId: kgold._id, status: ConnectionStatus.CONNECTED, trust: 4.7, tradeLimit: 75000 },
  ]);

  const tradeRequests = await TradeRequestModel.create([
    { fromUserId: demir._id, toUserId: alex._id, type: 'sell', metal: 'has', amount: 350, message: 'Elimde 350gr has var, ilgilenir misin?', status: RequestStatus.PENDING },
    { fromUserId: altinbas._id, toUserId: alex._id, type: 'buy', metal: '22ayar', amount: 1000, message: '22 ayar almak istiyorum, stok durumun?', status: RequestStatus.PENDING },
  ]);

  console.log('Seed completed successfully!');
  console.log(`  Users: ${users.length}`);
  console.log(`  Invite Codes: ${inviteCodes.length}`);
  console.log(`  Waitlist: ${waitlistEntries.length}`);
  console.log(`  Deals: ${deals.length}`);
  console.log(`  Offers: ${offers.length}`);
  console.log(`  Connections: ${connections.length}`);
  console.log(`  Trade Requests: ${tradeRequests.length}`);

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
