import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deal, DealDocument, DealStatus, DealType } from './schemas/deal.schema';
import { Offer, OfferDocument, OfferStatus } from '../offers/schemas/offer.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { DealQueryDto } from './dto/deal-query.dto';
import { DealsGateway } from './deals.gateway';

@Injectable()
export class DealsService {
  constructor(
    @InjectModel(Deal.name)
    private dealModel: Model<DealDocument>,
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private dealsGateway: DealsGateway,
  ) {}

  async createDeal(userId: string, dto: CreateDealDto) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    if (dto.type === DealType.SELL && !dto.minPrice) {
      throw new BadRequestException('Satış ilanı için minimum fiyat belirtmelisiniz');
    }
    if (dto.type === DealType.BUY && !dto.maxPrice) {
      throw new BadRequestException('Alış ilanı için maksimum fiyat belirtmelisiniz');
    }

    const deal = await this.dealModel.create({
      creatorId: new Types.ObjectId(userId),
      type: dto.type,
      metal: dto.metal,
      amount: dto.amount,
      minPrice: dto.minPrice || null,
      maxPrice: dto.maxPrice || null,
      status: DealStatus.ACTIVE,
    });

    const populated = await this.dealModel.findById(deal._id)
      .populate('creatorId', 'name handle avatar memberNo tier')
      .lean();

    this.dealsGateway.broadcastDealCreated(populated);

    return this.toDealResponse(populated, userId);
  }

  async getDeals(query: DealQueryDto, currentUserId?: string) {
    const filter: any = { status: DealStatus.ACTIVE };

    if (query.type) filter.type = query.type;
    if (query.metal) filter.metal = query.metal;
    if (query.creatorId) filter.creatorId = new Types.ObjectId(query.creatorId);

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));

    const deals = await this.dealModel
      .find(filter)
      .populate('creatorId', 'name handle avatar memberNo tier')
      .populate('winnerId', 'name handle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await this.dealModel.countDocuments(filter);

    return {
      data: deals.map((d) => this.toDealResponse(d, currentUserId)),
      meta: { page, limit, total },
    };
  }

  async getDealById(dealId: string, currentUserId?: string) {
    const deal = await this.dealModel.findById(dealId)
      .populate('creatorId', 'name handle avatar memberNo tier')
      .populate('winnerId', 'name handle')
      .lean();

    if (!deal) throw new NotFoundException('Deal not found');

    const offers = await this.offerModel
      .find({ dealId: deal._id })
      .populate('userId', 'name handle avatar memberNo tier')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      ...this.toDealResponse(deal, currentUserId),
      offers: offers.map((o) => ({
        id: o._id.toString(),
        userId: o.userId,
        price: o.price,
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }

  async placeOffer(dealId: string, userId: string, dto: CreateOfferDto) {
    const deal = await this.dealModel.findById(dealId).lean();
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.status !== DealStatus.ACTIVE) throw new BadRequestException('Bu ilan artık aktif değil');
    const uid = userId?.toString?.() || userId;
    if (deal.creatorId.toString() === uid) throw new BadRequestException('Kendi ilanına teklif veremezsin');

    if (deal.type === DealType.SELL && deal.minPrice && dto.price < deal.minPrice) {
      throw new BadRequestException(`Teklif minimum fiyatın (${deal.minPrice} TL) altında olamaz`);
    }
    if (deal.type === DealType.BUY && deal.maxPrice && dto.price > deal.maxPrice) {
      throw new BadRequestException(`Teklif maksimum fiyatın (${deal.maxPrice} TL) üstünde olamaz`);
    }

    const offer = await this.offerModel.create({
      dealId: new Types.ObjectId(dealId),
      userId: new Types.ObjectId(userId),
      price: dto.price,
      status: OfferStatus.PENDING,
    });

    await this.dealModel.updateOne(
      { _id: deal._id },
      { $inc: { offerCount: 1 } },
    );

    this.dealsGateway.broadcastOfferPlaced(dealId, {
      userId,
      price: dto.price,
    });

    return {
      success: true,
      message: 'Teklifiniz iletildi',
      offer: {
        id: offer._id.toString(),
        price: offer.price,
        status: offer.status,
        createdAt: offer.createdAt,
      },
    };
  }

  async acceptOffer(dealId: string, offerId: string, userId: string) {
    const deal = await this.dealModel.findById(dealId).lean();
    if (!deal) throw new NotFoundException('İlan bulunamadı');
    const uid = userId?.toString?.() || userId;
    if (deal.creatorId.toString() !== uid) throw new ForbiddenException('Bu ilan size ait değil');
    if (deal.status !== DealStatus.ACTIVE) throw new BadRequestException('İlan artık aktif değil');

    const offer = await this.offerModel.findById(offerId).lean();
    if (!offer) throw new NotFoundException('Teklif bulunamadı');
    if (offer.dealId.toString() !== dealId) throw new BadRequestException('Teklif bu ilana ait değil');
    if (offer.status !== OfferStatus.PENDING) throw new BadRequestException('Bu teklif zaten işlenmiş');

    await this.offerModel.updateOne(
      { _id: offer._id },
      { $set: { status: OfferStatus.ACCEPTED } },
    );

    await this.offerModel.updateMany(
      { dealId: deal._id, _id: { $ne: offer._id }, status: OfferStatus.PENDING },
      { $set: { status: OfferStatus.REJECTED } },
    );

    await this.dealModel.updateOne(
      { _id: deal._id },
      {
        $set: {
          status: DealStatus.CLOSED,
          winnerId: offer.userId,
        },
      },
    );

    const updatedDeal = await this.dealModel.findById(deal._id)
      .populate('creatorId', 'name handle avatar memberNo tier')
      .populate('winnerId', 'name handle')
      .lean();

    this.dealsGateway.broadcastOfferAccepted(updatedDeal);

    return {
      success: true,
      message: 'Teklif kabul edildi. İlan kapatıldı.',
      deal: this.toDealResponse(updatedDeal, userId),
    };
  }

  async cancelDeal(dealId: string, userId: string) {
    const deal = await this.dealModel.findById(dealId).lean();
    if (!deal) throw new NotFoundException('İlan bulunamadı');
    const uid = userId?.toString?.() || userId;
    if (deal.creatorId.toString() !== uid) throw new ForbiddenException('Bu ilan size ait değil');
    if (deal.status !== DealStatus.ACTIVE) throw new BadRequestException('İlan zaten kapalı');

    await this.dealModel.updateOne(
      { _id: deal._id },
      { $set: { status: DealStatus.CANCELLED } },
    );

    await this.offerModel.updateMany(
      { dealId: deal._id, status: OfferStatus.PENDING },
      { $set: { status: OfferStatus.REJECTED } },
    );

    this.dealsGateway.broadcastDealCancelled(dealId);

    return { message: 'İlan iptal edildi' };
  }

  async getUserDealHistory(userId: string) {
    const deals = await this.dealModel
      .find({
        $or: [
          { creatorId: new Types.ObjectId(userId) },
          { winnerId: new Types.ObjectId(userId) },
        ],
      })
      .populate('creatorId', 'name handle avatar memberNo tier')
      .populate('winnerId', 'name handle')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return deals.map((d) => this.toDealResponse(d, userId));
  }

  private toDealResponse(deal: any, currentUserId?: string) {
    const uid = currentUserId?.toString?.() || currentUserId;
    const isOwn = uid
      ? deal.creatorId?._id?.toString() === uid
      : false;

    return {
      id: deal._id.toString(),
      creator: deal.creatorId
        ? {
            id: deal.creatorId._id?.toString() || deal.creatorId.toString(),
            name: deal.creatorId.name,
            handle: deal.creatorId.handle,
            avatar: deal.creatorId.avatar,
            memberNo: deal.creatorId.memberNo,
            tier: deal.creatorId.tier,
          }
        : null,
      type: deal.type,
      metal: deal.metal,
      amount: deal.amount,
      minPrice: deal.minPrice,
      maxPrice: deal.maxPrice,
      status: deal.status,
      offerCount: deal.offerCount || 0,
      isOwn,
      winner: deal.winnerId
        ? {
            id: deal.winnerId._id?.toString() || deal.winnerId.toString(),
            name: deal.winnerId.name || deal.winnerId.handle,
          }
        : null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }
}
