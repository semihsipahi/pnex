import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { DealType, MetalType } from '../schemas/deal.schema';

export class CreateDealDto {
  @IsEnum(DealType)
  type: DealType;

  @IsEnum(MetalType)
  metal: MetalType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxPrice?: number;
}
