# PNEX — AGENTS.md

## Quick start
```sh
pnpm dev       # web dev server at :3000
pnpm build     # expo export --platform web → dist/
pnpm typecheck # npx tsc --noEmit
```

No tests or lint configured.

---

## Domain

**Purpose**: Trust-based P2P gold/currency trading network for the jewelry sector (kuyumcular), specifically Kapalıçarşı (Grand Bazaar) ecosystem.

**Concept**: PNEX (formerly NEXA) is a **design-only** UI project. Members trade among themselves via live auction listings, manage bilateral credit positions, and settle within a closed trust network. API will be built as a separate project.

**Target users**: Jewelry industry professionals — shop owners who trade gold (has altın, 22 ayar), USD, EUR among themselves daily.

**Key differentiator**: No existing app serves P2P trading between jewelry shops. Current apps (Minted, Nadirgold, AHL Pay) target individual investors. Borsa İstanbul KMP is institutional (1kg+). Kapalıçarşı runs on verbal trust — no promissory notes, no collateral. PNEX digitizes this existing trust network.

### Domain mechanics

**Gram-Based Accounting**
- Balances kept in gold units (has altın, 22 ayar), USD, or EUR — not TL
- "Falancada 350 gram has alacağım var" (I have 350g gold receivable from X)
- Real-world payment instrument: "çekili altın" (drawn gold) — 24k pure gold strips, no workmanship, low spread

**Live Auction Wall (Duvar)**
- Each listing has a countdown timer set by the seller (15min–4hr)
- **Hemen Al**: instant purchase at a premium price (> listing price, set by seller)
- **Teklif Ver**: buyer makes an offer — timer extends by +30s per bid (soft close)
- **Otomatik Kapanış**: when time expires, highest bidder wins automatically (no seller approval needed)
- Expired/claimed listings show winner badge
- Sellers cannot bid on their own listings (buttons disabled, show "Kendi İlanın")

**Network (Ağ)**
- Invitation-only: each user has a limited invite quota (e.g., 5), generates referral codes
- Member directory with trust score, credit limit, mutual connections
- Each member shows net position (+/-) with every other member
- **Talep Gönder**: send a private purchase/sale request to a specific firm (opens a modal)
- Incoming requests land as notifications for the target firm to approve/reject

**Trust / Credit Limit (Güven Limiti)**
- "Bu adamın piyasada limiti 5 kilo" = informal credit score
- Limit + mutual connections + past trades → trust score
- No promissory notes, no collateral — pure reputation

**Mutabakat (Settlement)**
- Members can request mutual netting (mahsuplaşma) against their bilateral positions
- Simple accept/reject flow — no complex accounting

**The Real Problem: Information Flow, Not Trust**
- Trust already exists in the bazaar
- Bottleneck: "Who is buying/selling right now?"
- PNEX solves: matching (eşleşme) + real-time info flow

---

## Architecture

### Tab structure (3 tabs + center action)

| Route | Tab name | Icon | Purpose |
|-------|----------|------|---------|
| `wall` | Duvar | grid | Live auction feed with countdown timers |
| `network` | Ağ | people | Member directory + talep/position management |
| `account` | Hesap | person | Profile, settings, personal limits |

Center **+** button — creates a new listing on Duvar (NewDealModal).

### Data models (design stage, static — no API)

```typescript
type DealType = "buy" | "sell"
type MetalType = "has" | "22ayar" | "usd" | "eur"

interface Deal {
  id: string
  firm: string
  role: string
  tier: "FOUNDING" | "INNER" | "TRUSTED"
  type: DealType
  metal: MetalType
  amount: string
  price: string
  pricePremium: string         // Hemen Al premium price
  trust: number
  limit: string
  mutual: number
  expiresIn: number            // remaining seconds (countdown)
  initialExpiresIn?: number    // for progress bar calculation
  status: "active" | "claimed" | "expired"
  offerCount?: number
  isOwn?: boolean              // true if listing belongs to current user
  winner?: string              // winning firm name when expired
}

interface NetworkMember {
  id: string
  name: string
  initial: string
  trust: number
  limit: string
  mutual: number
  position: string             // e.g. "+350gr Has"
  incomingRequests: number
}

interface RequestNotification {
  id: string
  from: string
  fromInitial: string
  type: DealType
  metal: string
  amount: string
  time: string
  status: "pending" | "approved" | "rejected"
}
```

### Design decisions (plan mode output)

| Decision | Choice |
|----------|--------|
| User roles | Every user is both buyer AND seller — select AL/SAT when listing |
| Auction close | **Automatic** — highest bid wins when timer expires |
| Invitation system | **Referral code + quota** — each user has limited invites (e.g., 5) |
| Private requests | **Yes** — "Talep Gönder" sends private buy/sell request to specific member |
| Soft close | **Yes** — each bid extends timer by +30s |

---

## Screen by screen — current state (Aşama 1 complete)

### SplashScreen — Vault Door (from pnex-app-figma)
- **Siyah perde açılması**: curtain opacity 1→0 (2.8s)
- **5 adet parıltı şeridi**: logo üzerinde sırayla geçen beyaz ışık çizgileri (t=1.8s–3.4s)
- **Vault door efekti**: PNEX logosu ortadan ikiye ayrılır — üst yarı yukarı (translateY: -50%), alt yarı aşağı (translateY: +50%) kayar (t=4.2s, 1.4s, bezier easing)
- **Altın ışık çizgisi**: logo ortasında beliren horizontal gold flash (seam)
- Tagline: "INVITATION ONLY" — fade in t=1.8s, fade out t=4.2s
- Toplam süre: ~5.6s, Reanimated ile implemente edildi

### Login (`(auth)/login.tsx`)
- Full-screen background image (`pnex-logo.png`) with `resizeMode="cover"` (splash ile aynı görsel)
- Bottom gradient overlay: transparent → %92 black → solid black, kaplama %55
- "Telefon Numarası" label (uppercase)
- +90 prefix (gold) + separator line + phone input (clean bottom-border only)
- Animated gold bottom line on focus (Reanimated)
- "İlerle" button with shimmer effect
- Dev shortcut: `5555555555` → straight to tabs
- Footer: lock icon + "UÇTAN UCA ŞİFRELİ · DAVETİYE İLE"

### Gate (`(auth)/gate.tsx`)
- **Logo hero background** (üst %44): pnex-logo.png, bottom gradient fade to black
- Back button (absolute, rounded, semi-transparent)
- Badge: "Sadece Üyeler · Davetiye İle"
- Title: "Davetiye Kodunuz" + subtitle
- Gold separator line with dot
- **6 hücreli kod girişi**: animated caret (blinking), spring scale character entry, gold border/glow on active
- "Erişim Talebi" button (disabled until 6 chars)
- "Davetiyeniz yok mu? Bekleme listesine katıl →"

### Wall — Duvar (`(tabs)/wall.tsx`)
- **Hero section**: "PNEX" logo + "Private Network" subtitle + notification bell
- **Hero stats card**: "BUGÜNKÜ PİYASA" with volume, change %, mini stats (aktif emir, aktif üye, network limiti)
- **Deal cards** with:
  - Avatar (first letter), firm name, tier badge (FOUNDING/INNER/TRUSTED)
  - Countdown timer with soft-close label "+30sn/teklif"
  - Amount (e.g., "2.500 gr"), metal label, type badge (ALIYOR / SATIYOR)
  - Price + premium price
  - Two CTAs: **Teklif Ver** (outline) + **Hemen Al** (gold filled, shows premium price)
  - **Kendi İlanın**: if `isOwn` is true, CTAs are hidden, shows "Kendi İlanın" badge
  - **Expired**: shows "SÜRE DOLDU" badge + winner name with trophy icon
  - Progress bar at top (time-based gradient)
  - Timer updates via `setInterval`, expired/deals drop offf after countdown
- Pressing Teklif Ver or Hemen Al alerts "Teklif verildi! (simülasyon)"

### Network — Ağ (`(tabs)/network.tsx`)
- **Header**: "NEXA Ağ" with gradient background + search bar placeholder
- **Gelen Talepler**: collapsible section with approval count badge
  - Request cards: sender avatar, type (AL/SAT), metal, amount, time
  - Actions: **Reddet** / **Onayla** → updates status text
- **Invite card**: "Davet Et" with invite code (PNEX-ABCD-12) + remaining quota (2 kaldı)
- **Network Üyeleri**: member list with avatar, trust score, limit, mutual count, position
  - **Talep** button on each member → opens **Talep Gönder modal**

### Account — Hesap (`(tabs)/account.tsx`)
- **Dark profile header**: avatar, name (@handle + member no), tier badge
- **Stats row**: connections (180), trades (09), trust score (4.9)
- **Menu rows**: Profili Düzenle, Gizlilik & Güvenlik, **Davetiyelerim** (2 kaldı), Üyelik Kademesi, Bildirimler, Danışman Desteği
- **Davetiyelerim modal**: shows remaining invites (2/5), invite code (PNEX-ABCD-12), copy + share buttons
- **Çıkış Yap** → routes to login

### NewDealModal (+ button)
- **Type toggle**: AL / SAT
- **Metal selector**: Has, 22 Ayar, USD, EUR (chips)
- **Amount + Price**: numeric inputs with suffix (gr / ₺/gr)
- **Premium Price**: "Hemen Al" premium, validates > price, shows % diff
- **Max Bid toggle**: optional "Maksimum Teklif Limiti" with switch toggle + input
- **Expiry chips**: 15dk / 30dk / 1sa / 2sa / 4sa
- **Submit**: "İlanı Yayınla" button with gold gradient
- Submits to console.log (static mock)

### TabBar
- 3 tabs (Duvar, Ağ, Hesap) + center + button
- Dark background (#0A0A0A), active state indicator (dot + gold icon/label)
- Plus button: gold gradient circle with spring scale animation
- No border radius (reverted to flat design)

---

## Routing (`app/`)

```
(auth)/
  login.tsx     — phone entry → gate
  gate.tsx      — 6-digit passcode → verify
  verify.tsx    — 4-digit OTP → wall
(tabs)/
  _layout.tsx   — tab bar + NewDealModal
  wall.tsx      — Duvar (live auction feed)
  network.tsx   — Ağ (members + requests)
  account.tsx   — Hesap (profile + settings)
```

Dev shortcut: phone `5555555555` → straight to `(tabs)/wall` (bypasses gate + verify)

---

## Stack

- **Framework**: Expo SDK 52 + expo-router (file-based routing), Metro bundler
- **Language**: TypeScript strict, path alias `@/*` → `./*`
- **Styling**: `StyleSheet.create` (no Tailwind/styled-components)
- **Animation**: `react-native-reanimated` (plugin in babel.config.js)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Gradients**: `expo-linear-gradient`
- **Fonts**: `expo-google-fonts` (Cormorant Garamond), system sans-serif

## Design tokens (`constants/theme.ts`)
- **Auth palette** (dark): `Colors.obsidian` (#0A0A0A), `Colors.gold` (#D4AF37 — figma palette)
- **In-app palette** (light): `Colors.paper` (#FBFAF8), `Colors.ink` (#16140F)
- **Semantic colors**: `goldFaint`, `goldDeep`, `goldBright`, `paperAlt`, `card`, `hairline`, `hairlineStrong`, `inkSoft`, `inkFaint`, `danger`, `success`, `onyx`, `white`

### Typography system
- **Brand font (serif)**: `CormorantGaramond` — weights: Regular, SemiBold, Bold
- **UI/Body font (sans)**: System sans-serif (SF Pro on iOS, -apple-system on web)
- **Convention**: `SansMedium` + `fontWeight: "500"`, `SansSemibold` + `fontWeight: "600"`
- **Tracking & TypeSize**: Defined in theme — logo (64, tracking 8), display (42, 18), h1 (32, 4), h2 (26), h3 (20), body (15), caption (12), small (11), micro (9)

## Conventions
- No semicolons
- `import { Colors, Fonts, Spacing, Radius } from "@/constants/theme"`
- `app.json` enables `"newArchEnabled": true` and `"typedRoutes": true`
- All data is static/mock — no API calls (separate project)

## Assets
- `assets/images/pnex-logo.png` — PNEX brand logo (splash screen, login background, gate hero)
- `assets/images/login-bg.png` — Legacy, replaced by pnex-logo.png (can be removed)
- `assets/images/wall-hero.png` — Wall page hero background
- `assets/images/nexa.png` — Legacy, not used anymore (replaced by pnex-logo)

## Aşama 2 (future — after API project)
- Invite code entry during registration
- Real API integration (separate project)
- Push notifications for bids/requests
- Live updates via WebSocket

## Relevant files
- `app/(tabs)/wall.tsx` — Live auction feed with all UI states (active, own, expired)
- `app/(tabs)/network.tsx` — Ağ directory + talep modal + invite card
- `app/(tabs)/account.tsx` — Profile + invite modal
- `app/(tabs)/_layout.tsx` — Tabs layout (wall, network, account)
- `app/(auth)/login.tsx` — Login screen (figma port: gradient overlay, label, clean input)
- `app/(auth)/gate.tsx` — Invitation code entry (figma port: hero bg, animated cells, back btn)
- `app/(auth)/verify.tsx` — OTP verification (figma port: large boxes, masked phone, blinking caret)
- `components/TabBar.tsx` — Bottom tab bar (3 tabs + center +)
- `components/NewDealModal.tsx` — Create listing form (premium + max bid + expiry)
- `components/SplashScreen.tsx` — Custom splash with vault door effect (figma port)
- `components/GoldButton.tsx` — Reusable gold gradient button
- `components/Divider.tsx` — Ornamental divider with optional label
- `constants/theme.ts` — Design tokens

---

## Fixes applied (2026-06-27)

| # | Issue | Files changed |
|---|-------|---------------|
| 1 | **NEXA → PNEX branding** — app.json name/slug/icon/scheme, theme.ts comment, network.tsx header, account.tsx version, gate.tsx logo still used old "NEXA" name | `app.json`, `constants/theme.ts`, `app/(tabs)/network.tsx`, `app/(tabs)/account.tsx`, `app/(auth)/gate.tsx` |
| 2 | **NewDealModal overlay dismiss çalışmıyordu** — sheet (`zIndex: 101`) tüm ekranı kapladığı için overlay (`zIndex: 100`)'in Pressable'ı hiçbir zaman tetiklenemiyordu. Sheet `top: 80` yapılarak üst kısımda overlay'in görünmesi ve tıklanabilmesi sağlandı. | `components/NewDealModal.tsx` |
| 3 | **NewDealModal exiting animasyonu yanlıştı** — `exiting={FadeIn(...)}` yerine `FadeOut` kullanılmalıydı. `FadeOut` import'ı eklendi. | `components/NewDealModal.tsx` |
| 4 | **SplashScreen ölü kod** — `glowWrap`, `glow`, `ring` stilleri ve `ringOpacity`/`ringScale` animasyonları hiçbir View'a bağlı değildi. | `components/SplashScreen.tsx` |
| 5 | **login.tsx spinner çalışmıyordu** — `borderTopColor: "transparent"` ile yapılan spinner dönmediği için statik yarım daire olarak kalıyordu. `ActivityIndicator` ile değiştirildi. | `app/(auth)/login.tsx` |
| 6 | **verify.tsx akışa bağlandı** — gate → wall yerine gate → verify → wall rotası kuruldu. Dev shortcut (5555555555) hala doğrudan wall'a gider. | `app/(auth)/gate.tsx` |
| 7 | **`.gitignore` eksikti** — root ve `pnex-app/` için `.gitignore` eklendi. Dev screenshot'ları (`*.png`) git dışında bırakıldı. | `.gitignore`, `pnex-app/.gitignore` |
