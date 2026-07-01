import { IsString } from 'class-validator';

export class RespondTradeRequestDto {
  @IsString()
  action: 'approve' | 'reject';
}
