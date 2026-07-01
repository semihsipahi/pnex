import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+90[0-9]{10}$/, { message: 'Phone must be in +90 format with 10 digits' })
  phone: string;

  @IsString()
  @Matches(/^[0-9]{4}$/, { message: 'OTP must be 4 digits' })
  code: string;
}
