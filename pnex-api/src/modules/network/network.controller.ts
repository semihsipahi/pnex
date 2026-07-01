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
import { NetworkService } from './network.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('network')
@UseGuards(JwtAuthGuard)
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('members')
  getMembers(@Query('q') query?: string) {
    return this.networkService.getMembers(query);
  }

  @Get('connections')
  getConnections(@CurrentUser('_id') userId: string) {
    return this.networkService.getConnections(userId);
  }

  @Get('requests')
  getRequests(@CurrentUser('_id') userId: string) {
    return this.networkService.getPendingRequests(userId);
  }

  @Post('connect')
  sendRequest(
    @CurrentUser('_id') userId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.networkService.sendConnectionRequest(userId, targetId);
  }

  @Patch('requests/:id')
  respond(
    @CurrentUser('_id') userId: string,
    @Param('id') connectionId: string,
    @Body('action') action: 'accept' | 'reject',
  ) {
    return this.networkService.respondToConnection(userId, connectionId, action);
  }
}
