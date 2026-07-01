import { IsString, IsNumber, Min } from 'class-validator';

export class CreateTradeRequestDto {
  @IsString()
  toUserId: string;

  @IsString()
  type: string;

  @IsString()
  metal: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  message: string;
}
