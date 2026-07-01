import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Public()
  @Post('verify')
  verifyInvite(@Body() dto: VerifyInviteDto) {
    return this.invitesService.verifyInvite(dto);
  }

  @Public()
  @Post('waitlist')
  joinWaitlist(@Body() dto: JoinWaitlistDto) {
    return this.invitesService.joinWaitlist(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-codes')
  getMyCodes(@CurrentUser('_id') userId: string) {
    return this.invitesService.getMyInviteCodes(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generateCode(@CurrentUser('_id') userId: string) {
    return this.invitesService.generateInviteCode(userId);
  }
}
