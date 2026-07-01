import { IsString, Matches } from 'class-validator';

export class CheckPhoneDto {
  @IsString()
  @Matches(/^\+90[0-9]{10}$/, { message: 'Phone must be in +90 format with 10 digits' })
  phone: string;
}
