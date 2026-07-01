import { IsString, Matches, IsOptional, MaxLength } from 'class-validator';

export class RegisterWithInviteDto {
  @IsString()
  @Matches(/^\+90[0-9]{10}$/, { message: 'Phone must be in +90 format with 10 digits' })
  phone: string;

  @IsString()
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  handle?: string;
}
