# PNEX — Figma Make Prompt

## Brand Identity

**Name**: PNEX (Private Network Exchange)
**Tagline**: "ENCRYPTED · INVITATION ONLY"
**Industry**: Trust-based P2P gold/currency trading network for jewelry sector (Kapalıçarşı)
**Target users**: Jewelry industry professionals trading gold (has altın, 22 ayar), USD, EUR

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| obsidian | #0A0A0A | Auth screens background |
| obsidianSoft | #121110 | Secondary dark surfaces |
| onyx | #1A1714 | Card backgrounds, input fields |
| gold | #C9A24B | Accents, active elements, icons |
| goldBright | #E7C778 | Highlights, logo, premium badges |
| goldDeep | #9C7C30 | Button gradient start |
| goldFaint | rgba(201,162,75,0.14) | Subtle gold tinted backgrounds |
| paper | #FBFAF8 | In-app body background |
| paperAlt | #F2F0EC | Secondary in-app background |
| card | #FFFFFF | In-app card backgrounds |
| ink | #16140F | Primary text in-app |
| inkSoft | #4A453C | Secondary text in-app |
| inkFaint | #8C8676 | Muted text in-app |
| hairline | #E7E3DB | Subtle borders in-app |
| hairlineStrong | #D8D2C6 | Stronger borders |
| success | #2E7D5B | Green accents, buy indicators |
| danger | #A8392F | Urgent timers, sell danger |
| white | #FFFFFF | Text on dark backgrounds |

### Typography

**Brand font (serif)**: Cormorant Garamond
- Regular, SemiBold, Bold weights
- Used for: logo, headings, display text

**Body font (sans)**: System sans-serif (SF Pro on iOS, -apple-system on web)
- Weights: 400 (regular), 500 (medium), 600 (semibold)
- Used for: UI elements, body text, labels

### Type Scale

| Token | Size | Letter-spacing | Usage |
|-------|------|----------------|-------|
| logo | 64px | 8px | PNEX branding on auth screens |
| display | 42px | 18px | Hero values, large display numbers |
| h1 | 32px | 4px | Section headers |
| h2 | 26px | — | Card titles, screen titles |
| h3 | 20px | — | Sub-sections |
| body | 15px | — | Body text |
| caption | 12px | — | Captions, labels |
| small | 11px | 0.5px | Meta text, badges |
| micro | 9px | — | Tiny labels |

### Spacing: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
### Border Radius: sm(10), md(16), lg(24), pill(999)

---

## Screen 1: Splash Screen

**Purpose**: App launch animation, brand intro

**Layout**:
- Full-screen black background (#0A0A0A)
- PNEX logo centered vertically and horizontally
- Bottom area: tagline "— ENCRYPTED · INVITATION ONLY —" in gold

**Components**:
1. **Background**: Solid obsidian (#0A0A0A)
2. **Logo**: PNEX brand logo image (`pnex-logo.png`), centered, contained within screen bounds
3. **Shimmer effect**: A bright white/gold diagonal gradient strip (90px wide, rotated 18deg) that sweeps from left to right across the logo area. The gradient is: transparent → rgba(255,245,210,0.55) → transparent. The sweep animation starts after 1.4s delay and lasts 2.8s.
4. **Tagline**: Bottom of screen, 64px from bottom edge. Text: "— ENCRYPTED · INVITATION ONLY —" in gold (#C9A24B), font size 11, letter-spacing 3, sans-serif medium. Animated fade-in + slide-up starting at 2.8s delay.
5. **Fade-out**: After ~8.5s total, the entire screen fades out over 1s, revealing the login screen.

**Animations**:
- Logo: fade-in over 2.2s
- Shimmer sweep: 2.8s starting at 1.4s delay
- Tagline: fade + translateY (12px→0) over 2s starting at 2.8s delay
- Total duration: ~8.5s, then fade-out transition

---

## Screen 2: Login (Phone Entry)

**Purpose**: Phone number entry for authentication. First screen after splash.

**Layout**:
- Full-screen dark background (#1C1C1C) with a background image (`login-bg.png`) covering the entire screen (resizeMode: cover) that contains the PNEX branding
- Content is laid out vertically with flex-based spacing: top area (shows PNEX branding from background), centered phone input, button at lower area

**Components**:
1. **Background image**: `login-bg.png` covering full screen with `resizeMode="cover"`, non-interactive
2. **Phone input field** (centered vertically):
   - Height: 58px
   - Background: rgba(255,255,255,0.04)
   - Border: 1px, rgba(255,255,255,0.08), radius 10px
   - Inner layout: left-to-right → "+90" prefix in gold (500 weight, 15px, letter-spacing 2.5) → 4px dot separator (rgba 0.15) → phone number input field
   - Input placeholder: "5XX XXX XX XX" in rgba(255,255,255,0.15)
   - Input text: white, 17px, letter-spacing 3, system font medium 500
   - Animated gold bottom line (1.5px height, left/right 12px margin) that expands from 0→100% width on focus, 350ms animation
3. **"İlerle" button** (bottom area):
   - Full width (with content padding 24px), pill shape (borderRadius: 999)
   - Height: 56px
   - Gradient: goldDeep (#9C7C30) → gold (#C9A24B) → goldBright (#E7C778) horizontal
   - Text: "İLERLE" uppercase, 14px, letter-spacing 1.5, semibold, color obsidian (#0A0A0A)
   - Disabled state: faint border rgba(255,255,255,0.06), text rgba(255,255,255,0.2)
   - Loading state: shows ActivityIndicator in obsidian color
   - Press feedback: scale animation (1→0.96 spring) + haptic + shimmer sweep overlay
   - Shimmer: 50% width gradient (transparent → rgba white 0.4 → transparent) that sweeps across button on press
4. **Assurance text**: Below button, centered row with lock icon (11px) + "UÇTAN UCA ŞİFRELİ · DAVETİYE İLE" text, 11px, rgba(255,255,255,0.3)

**Interactions**:
- Keyboard type: phone-pad
- Return key: "Done"
- Auto-focus on mount
- 10-digit Turkish phone format: 5XX XXX XX XX
- Pressing Done dismisses keyboard
- Button enabled only when 10 digits entered
- Dev shortcut: 5555555555 → bypasses to wall screen

---

## Screen 3: Gate (Invitation Code)

**Purpose**: 6-character alphanumeric invitation code entry.

**Layout**:
- Dark background (#0A0A0A) with subtle gold gradient glow at top (rgba(201,162,75,0.16) → transparent, 280px height)
- Vertical layout with safe area padding

**Components**:
1. **Top glow**: Linear gradient overlay at top 280px
2. **PNEX logo**: "PNEX" text in Cormorant Garamond Bold, 44px, goldBright (#E7C778), letter-spacing 12, centered
3. **Gold divider line**: 40px wide, 1px height, gold color, below logo
4. **Badge**: "SADECE ÜYELER" pill with shield icon + gold text, gold border (rgba 0.4), radius 999, padding 12x6
5. **Title**: "Davetiye ile" in serif bold, 38px, goldBright
6. **Subtitle**: Description text in system sans, 14px, inkFaint (#8C8676), centered, line-height 22
7. **Code input** (6 cells):
   - Cells arranged horizontally with 8px gap
   - Each cell: width = (screen - 48 - 40)/6, height = width * 1.25
   - Default state: bg onyx (#1A1714), border rgba(255,255,255,0.08), radius 12
   - Active/filled state: gold border, bg rgba(201,162,75,0.08)
   - Text: goldBright, 22px, semibold
   - Caret: vertical line, 2px wide, 22px tall, gold color
   - Hidden actual TextInput underneath
8. **"Erişim Talebi" button**: GoldButton component (gold gradient pill, same style as "İlerle")
9. **Divider**: "Davetiyeniz yok mu?" text divider
10. **Waitlist link**: "Bekleme listesine katıl" underlined text, inkFaint, 13px

---

## Screen 4: Verify (OTP)

**Purpose**: 4-digit OTP verification sent to registered device.

**Layout**:
- Dark background (#0A0A0A) with top gold glow
- Back button top-left
- Centered content

**Components**:
1. **Back button**: Circular (42x42), border rgba(255,255,255,0.1), gold chevron icon
2. **Icon ring**: Large circle (72x72) with keypad icon, gold border (rgba 0.4), goldBg (rgba 0.06)
3. **Title**: "Kimliğini Doğrula" in serif bold, 30px, goldBright
4. **Subtitle**: Description text, system sans 14px, inkFaint, centered
5. **OTP input** (4 boxes):
   - Boxes with md(16) gap, centered
   - Width = (screen - 48 - 48)/4, height = width * 1.15
   - Default: bg onyx, border rgba(255,255,255,0.08), radius 16
   - Active/filled: gold border, bg rgba(201,162,75,0.08)
   - Text: goldBright, 28px, semibold, centered
   - Hidden caret, each box has its own TextInput
   - Auto-advance to next on input
   - Backspace returns to previous
6. **Timer/resend**: Countdown from 42s, gold color for time. When expired, "Kodu yeniden gönder" link (goldBright, underlined, semibold 14px)
7. **"Onayla ve Gir" button**: GoldButton, disabled until all 4 digits filled

---

## Screen 5: Wall / Duvar (Main Tab)

**Purpose**: Live auction feed showing buy/sell listings with countdown timers.

**Layout**:
- Light background (#FBFAF8)
- ScrollView with hero header image + card + feed of deal cards
- Tab bar at bottom (Duvar, +, Ağ, Hesap)

**Components**:

### Hero Section
1. **Background image**: `wall-hero.png` with dark overlay gradient (rgba(10,10,10,0.55) → rgba(10,10,10,0.92))
2. **Top row**: "PNEX" logo (serif, h1, goldBright) + "Private Network" subtitle (sans medium, micro, gold) on left, notification bell icon button (circular 42x42, gold border 0.35) with red dot indicator on right
3. **Hero stats card**: Dark card (obsidian bg, 1px gold border at 0.12, radius 24px)
   - Top accent line: 2px gold at top edge
   - "BUGÜNKÜ PİYASA" label: 12px, uppercase, letter-spacing 3, rgba white 0.3
   - Value: "₺2.4M" in goldBright, 44px, semibold
   - Label: "Toplam İşlem Hacmi" in 14px, white 0.5
   - Change: "+18%" in green (#4CAF50), 13px + "Düne Göre" label
   - Divider: 1px rgba white 0.06
   - Mini stats row: 3 items (Aktif Emir, Aktif Üye, Network Limiti) with dot separators, values in white 0.7 14px, labels in white 0.25 9px letter-spacing 1.5

### Body Section
4. **Section header**: "Aktif Piyasa" (serif, h2, ink) + "Filtrele" chip (outline button with options icon)
5. **Deal cards** (onyx bg, radius 24px, 18px vertical / 22px horizontal padding, 12px mb):
   - **Left accent border**: 3px left border — green for buy, goldBright for sell
   - **Time progress bar**: Absolute top, 3px height, gradient (gold range or red when urgent <5min), with right cap dot
   - **Header**: Avatar circle (32px, gold-tinted or green-tinted border) with first letter → firm name (13px, semibold, white) → tier badge (star/diamond/shield icon with color) → spacer → timer (time-icon + MM:SS, border pill, red when urgent) + "+30sn/teklif" label
   - **Amount**: Large number (30px, white, semibold, e.g. "2.500 gr")
   - **Metal row**: Metal name (11px, white 0.3) · type dot (green/gold) · "ALIYOR"/"SATIYOR" (10px, uppercase, letter-spacing 1)
   - **Price**: Right-aligned, 20px, goldBright
   - **Premium price**: Right-aligned, 11px, gold at 0.45
   - **CTAs**: Two buttons side by side — "Teklif Ver" (outline, flex 1) + "Hemen Al" (filled, flex 1.3, accent tinted bg)
   - **Own listing**: Shows "Kendi İlanın" badge with eye-off icon instead of CTAs
   - **Expired**: Reduced opacity (0.4), shows "SÜRE DOLDU" badge + winner row with trophy icon + gold winner name

---

## Screen 6: Network / Ağ (Second Tab)

**Purpose**: Member directory, incoming trade requests, invite management.

**Layout**:
- Dark gradient header + light body
- ScrollView

**Components**:

### Header
1. **Gradient background**: onyx → obsidian gradient
2. **Title row**: "PNEX" (serif, goldBright) + "Ağ" (light text)
3. **Search bar**: Dark pill (rgba white 0.06 bg) with search icon + "Firma ara..." placeholder

### Body (paper bg, rounded top corners 28px)
4. **Gelen Talepler** (collapsible section):
   - Header with mail icon + "Gelen Talepler" title + count badge (gold bg, white text) + chevron
   - Request cards: avatar → firm name → type (AL/SAT) amount metal → time → action buttons (Reddet/Onayla) or status text
   - Acceptance flow: Reddet → "✕ Reddedildi", Onayla → "✓ Onaylandı"
5. **Invite card**: Small horizontal card with mail icon + "Davet Et" / "Kodun: PNEX-ABCD-12 · 2 hakkın kaldı" + add button
6. **Network Üyeleri** title: serif, h2, ink
7. **Member cards**:
   - Avatar circle → name → star rating/trust score (★ 4.8) · Limit: X kg · X ortak
   - Net position: colored text (+350gr Has in green, -180gr Has in red, $0 in gray)
   - "Talep" button: outline style, sends direct request (opens modal)

### Talep Gönder Modal
8. **Modal overlay**: Dark semi-transparent bg + sheet at top 80px with rounded top corners
9. **Form**: Type toggle (AL/SAT pills) → Metal chips (Has, 22 Ayar, USD, EUR) → Amount input → "Gönder" button

---

## Screen 7: Account / Hesap (Third Tab)

**Purpose**: User profile, settings, invite management.

**Layout**:
- Dark header section + light body
- ScrollView

**Components**:

### Header
1. **Gradient background**: onyx → obsidian
2. **Profile section**: Large avatar placeholder (initials) → name + @handle → member number → tier badge
3. **Stats row**: 3 items — X Bağlantı · X İşlem · X.X Güven Puanı

### Body (paper bg)
4. **Menu items**: Rows with icon + label + chevron:
   - Profili Düzenle
   - Gizlilik & Güvenlik
   - Davetiyelerim (2 kaldı) → opens invite code modal
   - Üyelik Kademesi
   - Bildirimler
   - Danışman Desteği
5. **Davetiyelerim modal**: Shows remaining invites (2/5), invite code (PNEX-ABCD-12), copy + share buttons
6. **Çıkış Yap**: Red/danger text at bottom, routes to login

---

## Screen 8: Tab Bar

**Purpose**: Bottom navigation between 3 tabs + center action button.

**Components**:
1. **3 tabs**: Duvar (grid icon), Ağ (people icon), Hesap (person icon)
2. **Center + button**: Gold gradient circle with spring scale animation on press, opens NewDealModal
3. **Styling**: Dark background (#0A0A0A), active tab has gold icon + gold indicator dot, inactive tabs have muted icons
4. **Stacks**: Each tab has its own stack navigator

---

## Screen 9: NewDealModal (Center + Button)

**Purpose**: Create a new buy/sell listing.

**Layout**:
- Modal overlay with dark translucent bg
- Sheet at top ~80px, dark bg, rounded top corners

**Components**:
1. **Type toggle**: Two pills — AL / SAT
2. **Metal selector**: Chips — Has, 22 Ayar, USD, EUR
3. **Amount input**: Numeric with "gr" suffix
4. **Price input**: Numeric with "₺/gr" suffix
5. **Premium price**: "Hemen Al" premium, validates > price, shows % difference
6. **Max bid toggle**: Switch + optional input
7. **Expiry chips**: 15dk / 30dk / 1sa / 2sa / 4sa
8. **Submit**: "İlanı Yayınla" gold gradient button

---

## React Native Implementation Notes for Figma

- All spacing uses theme constants: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- Border radius: sm(10), md(16), lg(24), pill(999)
- Font weights correspond to: "400" = regular, "500" = medium, "600" = semibold
- Auth screens: dark obsidian backgrounds, gold accents, glow effects with LinearGradient
- In-app screens: light paper backgrounds, dark ink text, gold/hairline borders
- Cards have onyx (#1A1714) dark background in the Wall tab
- Buttons use gold gradient (goldDeep → gold → goldBright) horizontal
- Deal cards have 3px left accent border (green for buy, gold for sell)
- Timers use red danger color when < 5 minutes remaining
- All pressable elements should have a subtle scale feedback (1→0.96) on press in
- Tab bar has dark bg (#0A0A0A) with center gold button