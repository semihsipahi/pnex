import { IsOptional, IsEnum, IsString } from 'class-validator';
import { DealType, MetalType, DealStatus } from '../schemas/deal.schema';

export class DealQueryDto {
  @IsOptional()
  @IsEnum(DealType)
  type?: DealType;

  @IsOptional()
  @IsEnum(MetalType)
  metal?: MetalType;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
