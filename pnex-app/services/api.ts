import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || (__DEV__ ? 'http://localhost:4000' : 'https://api.pnex.app');
export const API_BASE_URL = BASE_URL;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

export const apiService = {
  auth: {
    checkPhone: (phone: string) =>
      api<{ status: 'registered' | 'waitlisted' | 'new' }>('/auth/check-phone', {
        method: 'POST',
        body: { phone },
      }),
    sendOtp: (phone: string) =>
      api<{ message: string }>('/auth/send-otp', {
        method: 'POST',
        body: { phone },
      }),
    verifyOtp: (phone: string, code: string) =>
      api<{
        _id: string;
        phone: string;
        name: string;
        handle: string;
        memberNo: number;
        tier: string;
        accessToken: string;
        refreshToken: string;
      }>('/auth/verify-otp', {
        method: 'POST',
        body: { phone, code },
      }),
    registerWithInvite: (inviteCode: string, name: string, handle?: string) =>
      api<{
        _id: string;
        phone: string;
        name: string;
        handle: string;
        memberNo: number;
        tier: string;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register-with-invite', {
        method: 'POST',
        body: { inviteCode, name, handle },
      }),
    refresh: (refreshToken: string) =>
      api<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }),
  },
  invites: {
    verify: (code: string) =>
      api<{ valid: boolean; message: string }>('/invites/verify', {
        method: 'POST',
        body: { code },
      }),
    joinWaitlist: (phone: string) =>
      api<{ message: string }>('/invites/waitlist', {
        method: 'POST',
        body: { phone },
      }),
  },
  deals: {
    list: (token?: string) =>
      api<{
        data: DealDto[];
        meta: { page: number; limit: number; total: number };
      }>('/deals', { token }),
    getById: (id: string, token?: string) =>
      api<DealDetailDto>(`/deals/${id}`, { token }),
    create: (dto: CreateDealDto, token: string) =>
      api<DealDto>('/deals', {
        method: 'POST',
        body: dto,
        token,
      }),
    placeOffer: (dealId: string, price: number, token: string) =>
      api<{ success: boolean; message: string; offer: any }>(
        `/deals/${dealId}/offer`,
        { method: 'POST', body: { price }, token },
      ),
    acceptOffer: (dealId: string, offerId: string, token: string) =>
      api<{ success: boolean; message: string; deal: DealDto }>(
        `/deals/${dealId}/offers/${offerId}/accept`,
        { method: 'POST', token },
      ),
    cancel: (dealId: string, token: string) =>
      api<{ message: string }>(`/deals/${dealId}/cancel`, {
        method: 'PATCH',
        token,
      }),
    history: (token: string) =>
      api<DealDto[]>('/deals/history', { token }),
  },
};

export interface DealDto {
  id: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
    memberNo: number;
    tier: string;
  } | null;
  type: 'SELL' | 'BUY';
  metal: string;
  amount: number;
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  offerCount: number;
  isOwn: boolean;
  winner: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealDetailDto extends DealDto {
  offers: OfferDto[];
}

export interface OfferDto {
  id: string;
  userId: { _id: string; name: string; handle: string; avatar: string | null; memberNo: number; tier: string };
  price: number;
  status: string;
  createdAt: string;
}

export interface CreateDealDto {
  type: 'SELL' | 'BUY';
  metal: string;
  amount: number;
  minPrice?: number;
  maxPrice?: number;
}
