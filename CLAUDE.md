# CAFFIO APP

## Project Overview

Caffio is a premium consumer health app that controls a smart desk device dispensing precise micro-doses of caffeine concentrate. The app connects to a Python FastAPI backend (caffio-engine) via REST API and communicates with an ESP32-S3 hardware device via BLE. The aesthetic target is Whoop / Oura / Eight Sleep level polish — dark-mode-first, data-rich, trustworthy.

This is a caffeine dosing optimizer, NOT a medical device. Never use language like "treatment," "diagnosis," "cure," or "prevent" anywhere in the app.

## Tech Stack

- **Framework:** React Native with Expo SDK 54+
- **Language:** TypeScript (strict mode, no `any` types)
- **Navigation:** Expo Router v4 (file-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Charts:** Victory Native XL (Skia + Reanimated GPU-rendered)
- **Animation:** React Native Reanimated 3
- **Server State:** TanStack Query v5 (caching, background refetch, offline)
- **Client State:** Zustand (BLE status, user session, UI state)
- **Local Storage:** react-native-mmkv (synchronous, fast PK state persistence)
- **BLE:** react-native-ble-plx (with Expo config plugin)
- **Health Data:** expo-health (HealthKit) / react-native-health-connect (Google)
- **Icons:** Lucide React Native
- **Haptics:** expo-haptics
- **Notifications:** expo-notifications
- **Fonts:** Inter (body), DM Sans (UI), Bricolage Grotesque (metric display numbers)

## Design System

### Colors (Dark-Mode First)
```
Background:       #0A0A0B
Surface:          #131316
Surface Elevated: #1C1C21
Border:           #2A2A30
Text Primary:     #F5F5F7
Text Secondary:   #8E8E93
Text Muted:       #636366
Accent Primary:   #4ECDC4 (teal — caffeine level, positive states)
Accent Warning:   #FFB347 (amber — approaching limits)
Accent Danger:    #FF6B6B (red — denied, blocked, over threshold)
Accent Success:   #7ED321 (green — in target zone, safe)
Confidence Band:  #4ECDC4 at 10% opacity
Target Zone:      #7ED321 at 8% opacity
```

### Typography
- Metric display (caffeine level, dose amounts): Bricolage Grotesque, 48-64px
- Section headers: DM Sans SemiBold, 20-24px
- Body text: Inter Regular, 14-16px
- Labels/captions: Inter Medium, 12px
- All text colors use the design token names, never hardcoded hex values

### Component Patterns
- Cards: rounded-2xl, bg-surface, border border-border, p-4
- Buttons primary: bg-accent-primary, rounded-xl, py-3
- Buttons danger: bg-accent-danger for dose button
- Bottom sheets for settings/adjustments (keep main curve in context)
- Skeleton loaders (moti/skeleton) — never spinning wheels
- Haptic feedback on every button press and dose event

## Architecture

### Folder Structure
```
caffio-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator layout
│   │   ├── index.tsx             # Home: caffeine curve + dose button
│   │   ├── schedule.tsx          # Day schedule view
│   │   └── profile.tsx           # Settings, PK profile, genotype
│   ├── onboarding/
│   │   ├── welcome.tsx           # Welcome screen
│   │   ├── profile-setup.tsx     # Weight, height, age, sex
│   │   ├── health-screening.tsx  # Medications, conditions, contraindications
│   │   ├── preferences.tsx       # Wake/bed time, target level, genotype
│   │   └── device-setup.tsx      # BLE pairing flow
│   ├── device/
│   │   ├── setup.tsx             # BLE device pairing
│   │   └── status.tsx            # Device status, cartridge level
│   └── _layout.tsx               # Root layout
├── components/
│   ├── ui/                       # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── MetricDisplay.tsx     # Large number with trend indicator
│   ├── charts/
│   │   ├── CaffeineChart.tsx     # Main caffeine curve (Victory Native XL)
│   │   ├── ConfidenceBand.tsx    # Shaded uncertainty region
│   │   ├── ThresholdLine.tsx     # Horizontal target/cutoff lines
│   │   └── TimeIndicator.tsx     # Current time vertical marker
│   ├── dosing/
│   │   ├── DoseButton.tsx        # Big "Dose Me" button with haptic
│   │   ├── DoseLog.tsx           # Today's dose history
│   │   ├── CutoffBanner.tsx      # "Dosing complete for today" banner
│   │   └── DailyStats.tsx        # Current level, daily total, remaining
│   └── device/
│       ├── DeviceStatus.tsx      # BLE connection indicator
│       └── CartridgeLevel.tsx    # Cartridge fill gauge
├── lib/
│   ├── api/                      # TanStack Query hooks
│   │   ├── client.ts             # API client configuration
│   │   ├── useDoseRequest.ts     # POST /dose/request
│   │   ├── useSchedule.ts        # POST /schedule/generate
│   │   ├── useDoseConfirm.ts     # POST /dose/confirm
│   │   ├── useFeedback.ts        # POST /feedback/* endpoints
│   │   ├── useUserProfile.ts     # PUT /user/profile
│   │   ├── useCurve.ts           # GET /user/curve
│   │   └── useDeviceStatus.ts    # GET /device/status
│   ├── ble/
│   │   ├── manager.ts            # BLE connection manager singleton
│   │   ├── protocol.ts           # Caffio BLE service/characteristic UUIDs
│   │   └── commands.ts           # Dose command, status read, cartridge read
│   ├── pk/
│   │   ├── bateman.ts            # TypeScript mirror of Bateman equation
│   │   ├── parameters.ts         # PK constants (mirrors caffio-engine)
│   │   └── curve.ts              # Local curve prediction for instant UI
│   ├── store/
│   │   ├── useUserStore.ts       # User profile, PK parameters
│   │   ├── useBleStore.ts        # BLE connection state, device info
│   │   ├── useDoseStore.ts       # Today's doses, daily total
│   │   └── useSessionStore.ts    # Onboarding state, app preferences
│   ├── healthkit/
│   │   ├── sleep.ts              # Read sleep data
│   │   ├── caffeine.ts           # Write caffeine intake
│   │   └── hrv.ts                # Read HRV data
│   └── theme/
│       ├── tokens.ts             # All design tokens (colors, spacing, fonts)
│       └── utils.ts              # Theme utilities
├── constants/
│   └── config.ts                 # API base URL, BLE UUIDs, app constants
├── assets/
│   └── fonts/                    # Custom font files
└── __tests__/
    ├── components/               # Component tests
    ├── lib/                      # Hook and utility tests
    └── e2e/                      # Maestro YAML flows
```

### Data Flow
```
User presses "Dose Me"
  → lib/api/useDoseRequest.ts calls POST /dose/request
  → Server (caffio-engine) runs on-demand calculation
  → Returns dose amount or denial with reason
  → If approved:
    → lib/ble/commands.ts sends dispense command to ESP32
    → ESP32 runs pump, returns confirmation
    → lib/api/useDoseConfirm.ts confirms dose with server
    → lib/pk/curve.ts recalculates local curve instantly
    → CaffeineChart updates with new data
    → Haptic heavy impact fires
  → If denied:
    → Show denial reason in CutoffBanner
    → Haptic light impact fires
```

## API Contract

Backend runs at configurable base URL (default: http://localhost:8000 for dev).

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /dose/request | POST | On-demand dose calculation |
| /schedule/generate | POST | Generate full-day schedule |
| /dose/confirm | POST | Confirm dose was taken |
| /dose/skip | POST | Skip scheduled dose |
| /feedback/alertness | POST | Submit 1-5 alertness rating |
| /feedback/side-effect | POST | Report side effect |
| /feedback/sleep | POST | Submit sleep quality data |
| /user/profile | PUT | Create/update user profile |
| /user/curve | GET | Get predicted concentration curve |
| /device/status | GET | Hardware status and cartridge level |

All API calls go through TanStack Query hooks in lib/api/. Never fetch directly from components.

## BLE Protocol

- BLE state lives in Zustand bleStore ONLY
- Connection manager is a singleton in lib/ble/manager.ts
- Never call bleManager from component files directly
- Custom GATT service UUID for Caffio device protocol
- Characteristics: dose command (write), dose confirmation (notify), cartridge level (read/notify), device status (read)
- Auto-reconnect with exponential backoff (max 5 retries)
- Store bonded device ID in MMKV
- On iOS: push schedule to ESP32, don't rely on real-time BLE commands for dosing

## Local PK Model

Keep a TypeScript mirror of the Bateman equation in lib/pk/ for instant UI updates. Don't wait for API calls to redraw the curve — calculate locally for responsiveness, then confirm with the server. The local model uses the same parameters as the Python engine.

## Code Style

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Functional components only (no class components)
- Custom hooks for all business logic (components are pure UI)
- NativeWind utility classes for all styling — no StyleSheet.create
- Named exports only (no default exports except screens)
- All colors, spacing, fonts via design tokens — never hardcoded
- Google-style JSDoc on all public functions and hooks
- File naming: PascalCase for components, camelCase for hooks/utils

## Testing

- Unit/Component: Jest + React Native Testing Library
- E2E: Maestro (YAML-based flows)
- Run tests: `npx jest`
- Run E2E: `maestro test __tests__/e2e/`

## Build Order

Follow this exact sequence:

### Phase 1: Foundation
1. Initialize Expo project with TypeScript template
2. Install and configure NativeWind v4
3. Set up design tokens (theme/tokens.ts)
4. Build atomic UI components (Button, Card, Badge, MetricDisplay)
5. Set up Expo Router with tab layout
6. Create placeholder screens

### Phase 2: Core Data Layer
7. Set up TanStack Query client and API hooks
8. Set up Zustand stores (user, dose, session)
9. Configure MMKV for local persistence
10. Build TypeScript PK model mirror (lib/pk/)

### Phase 3: Main Screens
11. Build onboarding flow (profile setup, health screening, preferences)
12. Build home screen with CaffeineChart (Victory Native XL)
13. Build DoseButton with haptic feedback
14. Build DoseLog and DailyStats
15. Build schedule view
16. Build profile/settings screen

### Phase 3.5: Backend Integration
17. Start caffio-engine FastAPI server and configure the app's API base URL
18. Wire the home screen to call POST /dose/request when the user presses Dose Me, instead of using the local PK model only
19. Wire the home screen to fetch the caffeine curve from GET /user/curve
20. Wire the schedule screen to call POST /schedule/generate
21. Wire the profile screen to call PUT /user/profile when the user edits their profile
22. Keep the local PK model as a fallback for offline mode and instant UI updates, but the server response is the source of truth when available
23. Create the user profile on the server during onboarding completion

### Phase 4: Hardware Integration
24. Set up react-native-ble-plx with Expo config plugin
25. Build BLE connection manager
26. Build device pairing flow
27. Implement dose command via BLE

### Phase 5: Health & Feedback
28. HealthKit / Health Connect integration (sleep data)
29. Feedback prompts (alertness ratings, side effects)
30. Push notifications for scheduled mode

## What NOT To Do

- Do NOT use StyleSheet.create — use NativeWind utility classes
- Do NOT use Redux or Context API for state — use Zustand + TanStack Query
- Do NOT use react-native-chart-kit or SVG-based charts — use Victory Native XL (Skia)
- Do NOT use Material Design, UI Kitten, or React Native Paper components
- Do NOT hardcode colors, fonts, or spacing — use design tokens
- Do NOT fetch API data directly from components — use TanStack Query hooks
- Do NOT call bleManager from components — use the singleton in lib/ble/
- Do NOT use default exports (except Expo Router screens which require them)
- Do NOT use `any` type — ever
- Do NOT use spinning loading indicators — use skeleton loaders
- Do NOT use the word "treatment," "diagnosis," "cure," or "prevent" anywhere
- Do NOT show raw mg/L numbers without context — always pair with status colors and labels
- Do NOT let Claude Code sessions run longer than one feature — use fresh sessions
