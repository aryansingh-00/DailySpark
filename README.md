# DailySpark – Quotes & Motivation

DailySpark is a premium, enterprise-quality, offline-first motivational quotes dashboard built using React, Vite, TypeScript, and Tailwind CSS. The app features local notification alerts, customized motivational card exports, user streak and achievements trackers, User Messaging Platform (UMP) cookie controls, and mock AdMob integrations.

---

## 🏗️ Architecture & SOLID Principles

DailySpark follows clean architecture guidelines to enforce proper separation of concerns:

- **Domain/Models**: Holds typescript models and interfaces representing quotes, stats, achievements, and custom system Exceptions (`src/models/exceptions.ts`).
- **Repository Pattern**: Implements a storage layer (`src/repositories/storageRepository.ts`) that wraps local storage and isolates persistence operations. If the application needs to transition to a database (e.g. SQLite, IndexedDB), we only need to change the concrete repository.
- **Service Layer**: Decoupled orchestrators handling business policies like Quote filtering (`quoteService.ts`), mock Ads clicks (`adService.ts`), and browser notifications APIs (`notificationService.ts`).
- **Reactive Hooks**: Provides reactive state synchronizations across page boundaries, such as user stats updates (`useUserStats.ts`) and bookmarks (`useFavorites.ts`).

---

## ✨ Features Checklist

- **Stage 2 (Home Screen Complete)**: 
  - Fully reactive home page displaying QOTD cards, horizontal trending shelves, and search filters.
  - Offline database holding 200 realistic motivational quotes (`quotes.json`).
- **Stage 4 (Daily Engagement)**:
  - HTML5 Canvas drawing layout (`QuoteImageGenerator.tsx`) allowing customized background gradients, fonts, and high-resolution quote card downloads.
  - Notification scheduler alerts and streak trackers.
  - Dynamic user stats dashboard displaying weekly charts via Recharts.
- **Stage 5 (Monetization & Ads)**:
  - Bottom Adaptive Banners, 5-second countdown Interstitial Ads, and 10-second Rewarded video ad video players to lock categories.
  - GDPR/UMP-compliant cookie and personalized consent banner.
- **Stage 6 (Premium UI + Performance)**:
  - Frosted glassmorphism design styles.
  - Dynamic Custom Accents selector (Indigo, Emerald, Rose, Amber, Violet).
  - High-performance paginated listings and React.memo card instances.
  - Web vibration haptics on quote click/favorite.

---

## 🛠️ Commands

### Development Server
Starts the local development server:
```bash
npm run dev
```

### Production Build
Generates the production SSR Nitro and Client build:
```bash
npm run build
```

### Run Tests
Executes the Vitest unit and integration test suite:
```bash
npm run test
```

---

## 🧪 Testing Suite Coverage

The test suite contains 15 unit and integration tests written in Vitest covering:
1. **Storage Repository**: Mocked browser environments testing set, get, remove, missing-key, and corrupted JSON handles.
2. **Quote Service**: Testing quote database capacity, category-specific filters, real-time search queries, and random quote shufflers.
3. **Ad Service**: Testing personalized ad consents, premium lock toggles, and click tracking limits.
4. **Notification Service**: Testing morning/evening alerts preferences and denied permission throws.
