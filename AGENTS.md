# PNEX — Monorepo Root

## Project Structure

```
pnex/
├── pnex-app/           # Mobile app (Expo / React Native)
│   ├── app/            # expo-router file-based routes
│   ├── components/     # Reusable UI components
│   ├── constants/      # Theme, design tokens
│   └── AGENTS.md       # Mobile app details
├── pnex-api/           # Backend API (planned)
├── pnex-integration/   # Integration / middleware services (planned)
├── pnex-crm/           # CRM / admin panel (planned)
└── AGENTS.md           # This file — root overview
```

### pnex-app (existing)
**Stack**: Expo SDK 52, TypeScript, expo-router, Reanimated, expo-linear-gradient
**Purpose**: Trust-based P2P gold/currency trading UI for Kapalıçarşı jewelry sector
**Status**: Aşama 1 complete — static UI with mock data. API integration planned as separate project.
**Commands**: `pnpm dev`, `pnpm build`, `pnpm typecheck`
See `pnex-app/AGENTS.md` for full detail.

### pnex-app-figma (existing)
**Stack**: Vite 6 + React 18 + Framer Motion (motion) + Tailwind CSS v4 + shadcn/ui
**Purpose**: Figma tasarım referans uygulaması — Splash, Login, Gate, Verify, Duvar/Ağ/Hesap tabları
**Status**: Tüm ekranlar tek `App.tsx`'de state-based routing ile çalışır. Splash → Login → Gate → Verify → MainApp akışı.
**Key features**: Vault door splash efekti (logo ikiye ayrılır), premium dark tema (altın/gri), animated cell/caret girişleri.
**Notes**: Tasarım referansı olarak kullanılır. pnex-app'e port edilecek screen'ler bu projeden alınır.

### pnex-api (planned)
Backend service — will serve pnex-app, pnex-crm, and external integrations.
Tech stack TBD (likely Node.js/NestJS or Go).

### pnex-integration (planned)
Middleware for third-party integrations, data pipelines, WebSocket gateways.

### pnex-crm (planned)
Admin panel for user management, trade monitoring, settlement oversight.
Likely a web dashboard (Next.js or similar).

---

## Conventions
- Each sub-project has its own `AGENTS.md` with project-specific details
- Shared config (CI, linting, etc.) may be added at root level as the monorepo grows
- No monorepo tooling yet (pnpm workspace, turborepo, etc.) — to be evaluated as sub-projects materialize
- **Code trial principle**: When a solution is written, tested by the user, and reported as not working, the old code MUST be fully removed from source before a new approach is attempted. Never leave dead/broken code paths in the file.
test: repo rename doğrulama
