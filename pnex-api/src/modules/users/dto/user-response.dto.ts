export class UserResponseDto {
  _id: string;
  phone: string;
  name: string | null;
  handle: string | null;
  memberNo: number;
  avatar: string | null;
  tier: string;
  trustScore: number;
  tradeLimit: number;
  totalTrades: number;
  totalVolume: number;
  connections: number;
  inviteQuota: { total: number; used: number };
  isOnboarded: boolean;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;
}
