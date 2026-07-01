import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { InviteCode, InviteCodeSchema } from './schemas/invite-code.schema';
import { Waitlist, WaitlistSchema } from './schemas/waitlist.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InviteCode.name, schema: InviteCodeSchema },
      { name: Waitlist.name, schema: WaitlistSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
