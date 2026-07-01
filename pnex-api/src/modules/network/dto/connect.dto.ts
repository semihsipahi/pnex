import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SendConnectionDto {
  @IsString()
  targetId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondConnectionDto {
  @IsString()
  connectionId: string;

  @IsString()
  action: 'accept' | 'reject';
}
