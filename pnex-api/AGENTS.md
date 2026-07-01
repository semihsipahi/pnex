# PNEX API — NestJS Backend

## Stack
- NestJS 11 + TypeScript
- MongoDB (Mongoose) — Compass için `mongodb://localhost:27017/pnex`
- JWT (access + refresh token) — Passport Strategy
- WebSocket (Socket.IO) — `/deals` namespace

## Quick Start

```bash
pnpm install
pnpm seed      # Mock data yükler
npm run start:dev # http://localhost:4000
```

## Auth Flow

```
POST /auth/check-phone
    │
    ├── "registered" ──→ Login → OTP (send-otp) → verify-otp → JWT → Wall
    │
    ├── "waitlisted" ──→ Waitlist blocked screen (geri butonu, bilgi mesajı)
    │                      Admin: POST /auth/waitlist/approve → users'a taşır
    │
    └── "new" ────────→ Davetiye Kodu (Gate)
                           │
                           ├── Geçerli Kod → Kayıt Formu (name + handle)
                           │   → register-with-invite → JWT → Wall
                           │
                           └── Geçersiz Kod → Hata / waitlist'e yönlendir
```

### 3 Case Detayı

**Case 1 — Registered** (`check-phone` → `{ status: "registered" }`)
- Kullanıcı phone'u `users` collection'da var ve `isActive: true`
- Mobil: OTP ekranı gösterilir
- `send-otp` → SMS yokken "1111" kodu döner (hash'lenir, 42sn geçerli)
- `verify-otp` → başarılı JWT döner → Wall'a yönlenir

**Case 2 — Waitlisted** (`check-phone` → `{ status: "waitlisted" }`)
- Kullanıcı phone'u `waitlist` collection'da `WAITING` statüsünde
- Admin eliyle `POST /auth/waitlist/approve` çağrılana kadar bekler
- Onaylanınca waitlist → `users` (isActive: true, memberNo atanır)

**Case 3 — New** (`check-phone` → `{ status: "new" }`)
- Kullanıcı ne `users`'da ne `waitlist`'te
- `POST /invites/verify` ile kod doğrulanır
- Geçerliyse → Kayıt Formu (firma adı required, kullanıcı adı optional)
- `POST /auth/register-with-invite` → user oluşur + invite code USED → JWT → Wall
- Geçersiz kod → hata mesajı + waitlist'e katılma seçeneği

## MongoDB Collections

| Collection | Açıklama |
|-----------|----------|
| `users` | Kullanıcılar (phone auth, tier, trust score, invite quota) |
| `otps` | OTP kodları (hashli, 42sn TTL, 3 deneme hakkı) |
| `invite_codes` | Davetiye kodları (PNEX-XXXX-XX format) |
| `waitlist` | Bekleme listesi |
| `deals` | İlanlar (SELL/BUY, status: ACTIVE/CLOSED/CANCELLED) |
| `offers` | Teklifler (PENDING/ACCEPTED/REJECTED) |
| `connections` | Ağ bağlantıları (trust score, trade limit) |
| `trade_requests` | Al/Sat talepleri |
| `notifications` | Bildirimler |

## API Endpoints

### Health
- `GET /` — Sağlık kontrolü

### Auth (Public)
- `POST /auth/check-phone` — Telefon kontrolü → `registered | waitlisted | new`
- `POST /auth/send-otp` — Sadece `registered` kullanıcılara OTP gönder (SMS yokken "1111")
- `POST /auth/verify-otp` — OTP doğrula + JWT döndür
- `POST /auth/refresh` — Refresh token ile yeni token
- `POST /auth/logout` — Çıkış yap
- `POST /auth/register-with-invite` — Davetiye kodu ile kayıt ol + JWT
- `POST /auth/waitlist/approve` — (Admin) Waitlist'ten users'a geçir

### Users (JWT Required)
- `GET /users/me` — Profilim
- `PUT /users/me` — Profil güncelle
- `GET /users/:id` — Kullanıcı detay
- `GET /users/search?q=` — Kullanıcı ara
- `GET /users/leaderboard` — Lider tahtası

### Invites
- `POST /invites/verify` (public) — Davetiye kodu doğrula
- `POST /invites/waitlist` (public) — Bekleme listesine katıl
- `GET /invites/my-codes` (jwt) — Kodlarım
- `POST /invites/generate` (jwt) — Yeni kod oluştur

### Deals ⭐ (Core)
- `GET /deals` (public) — Aktif ilanlar (filtre: type, metal)
- `GET /deals/:id` (public) — İlan detay + teklifler
- `GET /deals/history` (jwt) — Geçmiş ilanlarım
- `POST /deals` (jwt) — İlan oluştur (type=SELL → minPrice, type=BUY → maxPrice)
- `POST /deals/:id/offer` (jwt) — Teklif ver (price ile)
- `POST /deals/:id/offers/:offerId/accept` (jwt) — Teklifi kabul et (sadece ilan sahibi)
- `PATCH /deals/:id/cancel` (jwt) — İlanı iptal et

### Network
- `GET /network/members?q=` — Üye ara
- `GET /network/connections` — Bağlantılarım
- `GET /network/requests` — Gelen bağlantı istekleri
- `POST /network/connect` — Bağlantı isteği gönder
- `PATCH /network/requests/:id` — Bağlantıyı kabul/red

### Trade Requests
- `GET /trade-requests/incoming` — Gelen talepler
- `GET /trade-requests/outgoing` — Giden talepler
- `POST /trade-requests` — Talep gönder
- `PATCH /trade-requests/:id` — Talebi onayla/red

### Notifications
- `GET /notifications` — Bildirimlerim
- `PATCH /notifications/:id/read` — Okundu işaretle
- `PATCH /notifications/read-all` — Tümünü okundu işaretle

## Deals Mekaniği

### İlan Tipleri
- **SELL**: Satıcı ilanı açar, minimum fiyat (`minPrice`) belirtir. Diğer kullanıcılar teklif verir (alıcıdır). Satıcı en yüksek teklifi seçer.
- **BUY**: Alıcı ilanı açar, maksimum fiyat (`maxPrice`) belirtir. Diğer kullanıcılar teklif verir (satıcıdır). Alıcı en düşük teklifi seçer.

### Teklif Akışı
1. İlan sahibi `POST /deals/:id/offer` ile teklif alır
2. Teklifler `PENDING` statüsünde listelenir
3. İlan sahibi `POST /deals/:id/offers/:offerId/accept` ile bir teklifi kabul eder
4. Kabul edilen teklif → `ACCEPTED`, diğerleri → `REJECTED`
5. İlan → `CLOSED`, kazanan `winnerId` olarak atanır

### İlan Status'leri
- `ACTIVE` — Tekliflere açık
- `CLOSED` — Bir teklif kabul edildi
- `CANCELLED` — İlan sahibi iptal etti

### WebSocket — `/deals`

| Olay | Yön | Açıklama |
|------|-----|----------|
| `deal.created` | Server → Client | Yeni ilan |
| `deal.offer.placed` | Server → Client | Teklif alındı |
| `deal.closed` | Server → Client | Teklif kabul edildi, ilan kapandı |
| `deal.cancelled` | Server → Client | İlan iptal edildi |

## Seed Data
```bash
npm run seed
```
- 4 kullanıcı (Alexander Mercer, Altınbaş, Demir Sarraf, Kapalıçarşı Gold)
- 5 ilan (3 aktif SELL/BUY, 1 kapalı, 1 aktif)
- 8 teklif
- 3 bağlantı, 2 trade request
- 3 invite code (PNEX-ABCD-12 aktif)
- 1 waitlist entry
