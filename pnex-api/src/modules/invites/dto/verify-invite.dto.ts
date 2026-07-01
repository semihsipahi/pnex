import { IsString, Matches } from 'class-validator';

export class VerifyInviteDto {
  @IsString()
  @Matches(/^[A-Z0-9\-]{10,15}$/, { message: 'Invalid invite code format' })
  code: string;
}
