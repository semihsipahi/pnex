import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { DealQueryDto } from './dto/deal-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get()
  getDeals(@Query() query: DealQueryDto, @CurrentUser('_id') userId?: string) {
    return this.dealsService.getDeals(query, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@CurrentUser('_id') userId: string) {
    return this.dealsService.getUserDealHistory(userId);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  getDeal(@Param('id') id: string, @CurrentUser('_id') userId?: string) {
    return this.dealsService.getDealById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createDeal(@CurrentUser('_id') userId: string, @Body() dto: CreateDealDto) {
    return this.dealsService.createDeal(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/offer')
  placeOffer(
    @CurrentUser('_id') userId: string,
    @Param('id') dealId: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.dealsService.placeOffer(dealId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/offers/:offerId/accept')
  acceptOffer(
    @CurrentUser('_id') userId: string,
    @Param('id') dealId: string,
    @Param('offerId') offerId: string,
  ) {
    return this.dealsService.acceptOffer(dealId, offerId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelDeal(@CurrentUser('_id') userId: string, @Param('id') dealId: string) {
    return this.dealsService.cancelDeal(dealId, userId);
  }
}
