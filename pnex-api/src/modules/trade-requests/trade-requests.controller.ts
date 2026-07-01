import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TradeRequestsService } from './trade-requests.service';
import { CreateTradeRequestDto } from './dto/create-trade-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('trade-requests')
@UseGuards(JwtAuthGuard)
export class TradeRequestsController {
  constructor(private readonly tradeRequestsService: TradeRequestsService) {}

  @Get('incoming')
  getIncoming(@CurrentUser('_id') userId: string) {
    return this.tradeRequestsService.getIncomingRequests(userId);
  }

  @Get('outgoing')
  getOutgoing(@CurrentUser('_id') userId: string) {
    return this.tradeRequestsService.getOutgoingRequests(userId);
  }

  @Post()
  sendRequest(@CurrentUser('_id') userId: string, @Body() dto: CreateTradeRequestDto) {
    return this.tradeRequestsService.sendRequest(userId, dto);
  }

  @Patch(':id')
  respond(
    @CurrentUser('_id') userId: string,
    @Param('id') requestId: string,
    @Body('action') action: 'approve' | 'reject',
  ) {
    return this.tradeRequestsService.respondToRequest(userId, requestId, action);
  }
}
