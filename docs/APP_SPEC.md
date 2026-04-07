# Caffio App — Product Specification

> Premium caffeine dosing optimizer app. Dark-mode-first health aesthetic.
> Connects to caffio-engine (FastAPI backend) and ESP32-S3 hardware device (BLE).

---

## 1. Product Overview

Caffio is a mobile app that helps users optimize their caffeine intake throughout the day. The user presses a button when they want caffeine, and the system calculates the exact right amount based on their pharmacokinetic profile, current estimated blood caffeine level, time of day, and sleep protection constraints. A smart desk device dispenses the precise dose into their drink.

The app is the user's primary interface. It shows their predicted caffeine curve, controls dosing, collects feedback, and communicates with the hardware device.

### 1.1 Target User

Knowledge workers aged 25-45 who drink 2-4 cups of coffee daily and care about optimizing their energy and sleep. They use products like Whoop, Oura, Eight Sleep, or AG1. They are willing to pay $99-149 for a device and $30-35/month for cartridge refills.

### 1.2 Core Value Proposition

Replace the coffee spike-and-crash cycle with smooth, consistent, optimized caffeine levels throughout the workday — automatically calibrated to protect sleep quality.

---

## 2. User Flows

### 2.1 Onboarding (First Launch)

**Screen 1 — Welcome**
- Hero animation of the caffeine curve concept (smooth steady line vs spiky coffee pattern)
- "Optimize Your Caffeine" headline
- "Get Started" CTA

**Screen 2 — Profile Setup**
- Weight (kg), Height (cm), Age, Sex
- Minimal, clean input with large touch targets
- "Why we need this" expandable explanation (used for pharmacokinetic calculations)

**Screen 3 — Health Screening**
- Medical conditions checklist: Pregnancy, Liver disease, Cardiac condition, Seizure disorder
- Medications: text input with common suggestions (fluvoxamine, ciprofloxacin, oral contraceptives)
- If any ABSOLUTE contraindication detected: show clear block screen explaining why Caffio cannot be used
- If WARNING/CAUTION conditions: show adjusted limits and continue

**Screen 4 — Preferences**
- Wake time picker (default 07:00)
- Bed time picker (default 23:00)
- CYP1A2 Genotype selector (AA/AC/CC/I don't know) with "What is this?" explainer
- Optional: "Upload genetic data from 23andMe" link
- Smoking status toggle
- Current daily caffeine intake estimate (slider: 0-600mg)

**Screen 5 — Device Setup**
- BLE scan for Caffio device
- Pairing flow with animation
- Cartridge insertion confirmation
- "Skip for now" option (app works without hardware in simulation mode)

**Screen 6 — Calibration Period Notice**
- "Your first 7-14 days are a calibration period"
- Explain that doses may be conservative while the system learns their body
- "The system gets smarter every day"

### 2.2 Daily Use — Home Screen

The home screen is the core experience. Everything the user needs at a glance.

**Layout (top to bottom):**

1. **Status Bar Area**
   - Current time, device connection indicator (green dot / red dot)
   - Cartridge level icon

2. **Metric Card**
   - Large caffeine level number (e.g., "2.7 mg/L") in Bricolage Grotesque 48px
   - Trend indicator arrow (↑ rising / ↓ falling / → stable)
   - Status pill: "In the Zone" (green) / "Building Up" (yellow) / "Winding Down" (blue) / "Dosing Complete" (gray)
   - Subtle animated glow around the number in the status color

3. **Caffeine Curve Chart**
   - Full-width Victory Native XL chart
   - Time axis (wake to bedtime, hourly labels)
   - Caffeine concentration line (accent-primary teal)
   - Confidence band (shaded ±uncertainty)
   - Target zone (green shaded horizontal band)
   - Bedtime threshold (dotted red horizontal line at 1.0 mg/L)
   - Current time indicator (vertical white line, labeled "Now")
   - Dose markers (dots on the curve where doses were taken, labeled with mg)
   - Interactive: tap anywhere on the curve to see predicted level at that time
   - Smooth Reanimated transitions when data updates

4. **Dose Button**
   - Large, prominent circular button: "DOSE ME"
   - Red/coral accent color when available
   - Gray when dosing is complete for the day
   - Press triggers:
     - Heavy haptic impact
     - API call to /dose/request
     - If approved: BLE command to device, curve updates, dose marker appears
     - If denied: light haptic, denial reason displayed in a toast/banner
   - Shows dose amount after press ("25 mg dispensed")

5. **Daily Summary Bar**
   - Daily total: "157 / 399 mg"
   - Doses today: "5 doses"
   - Next cutoff: "Dosing until 14:30"
   - Tappable to expand into full dose log

6. **Dose Log (Expandable)**
   - Chronological list of today's doses
   - Each entry: time, amount, "to reach 3.0 mg/L" reason
   - Denied attempts shown in muted text with reason

### 2.3 Schedule View (Tab 2)

For users who prefer scheduled mode over on-demand.

- Toggle: "On-Demand" / "Scheduled" mode switch
- If scheduled: show the full day's pre-planned dose list
- Each scheduled dose shows: time, amount, status (upcoming / taken / skipped)
- Tappable to skip or confirm early
- Same caffeine curve chart showing the projected schedule curve

### 2.4 Profile & Settings (Tab 3)

- User profile summary (weight, height, genotype, modifiers)
- Edit profile (recalculates PK parameters)
- Target caffeine level slider (1.5 - 6.0 mg/L)
- Bedtime threshold slider (0.3 - 2.0 mg/L)
- Wake/bed time adjustment
- Tolerance management settings (cycling on/off, reset schedule)
- Device management (paired device, cartridge status, unpair)
- Data export
- About / legal / disclaimers

### 2.5 Feedback Prompts

The app occasionally prompts for feedback to feed the Adaptation Engine.

**Alertness Check (2-3x per day, dismissable):**
- "How alert do you feel right now?" 
- 5-point scale with emoji faces (very tired → very alert)
- Quick tap, disappears in 3 seconds

**Sleep Quality (Morning, once per day):**
- "How did you sleep last night?"
- 5-point scale
- Optional: "Did caffeine affect your sleep?" yes/no

**Side Effect Report (Always accessible from menu):**
- "Report a side effect"
- Options: Jitters, Anxiety, Heart racing, GI distress, Headache, Other
- Timestamp auto-captured

---

## 3. Caffeine Curve Chart Specification

This is the most important UI element in the app. It must be flawless.

### 3.1 Technical Implementation

- Library: Victory Native XL (CartesianChart)
- Rendering: Skia GPU thread (never JS thread)
- Animation: Reanimated shared values for smooth curve transitions
- Touch: ChartPressState for interactive tooltip on tap

### 3.2 Data Layers (Bottom to Top)

1. **Target zone fill** — horizontal green band between target ± 0.5 mg/L
2. **Confidence band fill** — shaded area between upper_bound and lower_bound (teal at 10% opacity)
3. **Caffeine concentration line** — solid teal line, 2.5px weight
4. **Stimulant load line** — optional toggle, lighter green, shows total alertness effect
5. **Paraxanthine line** — optional toggle, dashed orange
6. **Bedtime threshold** — horizontal dotted red line at 1.0 mg/L
7. **Concentration ceiling** — horizontal dashed line at 8.0 mg/L (safety, usually off-screen)
8. **Current time indicator** — vertical white line at current time, labeled "Now"
9. **Bedtime cutoff indicator** — vertical dashed purple line at cutoff time
10. **Dose markers** — red/coral dots at each dose time, labeled with mg amount

### 3.3 Interactions

- **Tap anywhere on curve:** Show tooltip with time and predicted concentration
- **Long press on dose marker:** Show dose details (amount, reason, time)
- **Pinch to zoom:** Expand/contract time range (optional, Phase 2)
- **Swipe left/right:** Scroll through historical days (optional, Phase 3)

### 3.4 Update Behavior

- When a new dose is taken: recalculate the entire future curve locally (lib/pk/bateman.ts) and animate the chart transition with Reanimated withTiming
- When a dose is denied: no curve change, show denial toast
- Every 5 minutes: update the "Now" indicator position
- On app foreground: fetch latest data from server and reconcile with local state

---

## 4. Offline Behavior

When the caffio-engine server is reachable, the app calls the real API for all dose calculations, curve data, schedule generation, and profile updates. The server response is the source of truth. The local PK model provides instant UI updates while API calls are in flight, but is reconciled with the server response when it arrives.

When the server is not reachable, the app falls back to fully offline mode:

### 4.1 Without Internet

- Local PK model (lib/pk/) calculates curves and dose recommendations as the primary source
- TanStack Query caches last known server state and serves stale data
- Doses are queued locally and synced when connection returns
- All UI remains functional using the local PK model
- When connectivity is restored, the app re-fetches from the server and reconciles any local state

### 4.2 Without Hardware Device

- App works in "simulation mode"
- User can see their curve and get dose recommendations
- Instead of BLE dispense, show: "Recommended: take 25mg caffeine now"
- User manually confirms dose (tap "I took it")
- Useful for pilot users without hardware, or when device is charging

---

## 5. Notifications

### 5.1 Scheduled Mode Notifications

- "Time for your next dose (25mg)" — at each scheduled dose time
- Tapping opens the app to the home screen with dose button ready

### 5.2 Status Notifications

- "Dosing complete for today — enjoy your evening" — when bedtime cutoff is reached
- "Cartridge running low (15% remaining)" — from device status
- "Device disconnected" — if BLE drops for >5 minutes during active dosing window

### 5.3 Feedback Prompts

- "Quick check: how alert are you?" — 2-3x per day during dosing window
- "How did you sleep?" — once per day, 30 minutes after wake time

---

## 6. Safety UI

### 6.1 Contraindication Block Screen

If a user's profile triggers an ABSOLUTE contraindication:
- Full screen with clear explanation
- "Caffio cannot provide dosing recommendations for your profile"
- Specific reason (e.g., "Fluvoxamine interacts strongly with caffeine metabolism")
- "Consult your healthcare provider" message
- No dose button, no curve, no schedule

### 6.2 Warning States

If WARNING or CAUTION conditions:
- Yellow/amber banner at top of home screen
- "Your daily limit is reduced to 200mg due to ciprofloxacin"
- Dosing still works within adjusted limits

### 6.3 Dosing Denial UI

When dose is denied:
- Light haptic buzz (not heavy — that's for success)
- Toast/banner with reason in plain language:
  - "You're already at your target level"
  - "Dosing is complete for today to protect your sleep"
  - "Please wait 30 minutes between doses"
  - "Daily caffeine limit reached"
- Banner auto-dismisses after 4 seconds

### 6.4 Disclaimer

On first launch and accessible from settings:
- "Caffio is a wellness tool, not a medical device"
- "Not intended to diagnose, treat, cure, or prevent any disease"
- "Consult your healthcare provider before changing your caffeine habits"
- "Caffeine affects individuals differently — this system provides estimates, not precise measurements"

---

## 7. Device Communication

### 7.1 BLE Service Architecture

```
Caffio Service UUID: [custom UUID]
├── Dose Command      (Write)     — Send dose amount in mg
├── Dose Confirmation (Notify)    — Device confirms dose dispensed
├── Cartridge Level   (Read/Notify) — Remaining mL in cartridge
├── Device Status     (Read)      — Connection, pump, error state
└── Firmware Version  (Read)      — For update checking
```

### 7.2 Connection Flow

1. Scan for devices advertising Caffio Service UUID
2. Connect and discover services
3. Bond on first connection (store device ID in MMKV)
4. Subscribe to Dose Confirmation and Cartridge Level notifications
5. Read initial Device Status and Firmware Version
6. Ready for dosing commands

### 7.3 Reconnection

- On disconnect: exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 retries)
- After 5 failures: surface UI error "Device disconnected — check power"
- On reconnect: re-read status, re-subscribe to notifications
- Never block dosing UI while reconnecting — show "Device offline" but keep the dose recommendation visible

---

## 8. Analytics Events

Track these for understanding usage and improving the product:

| Event | Properties |
|-------|-----------|
| onboarding_started | — |
| onboarding_completed | time_to_complete, genotype_provided |
| dose_requested | time_of_day, current_level, target |
| dose_dispensed | amount_mg, daily_total, dose_number |
| dose_denied | reason, time_of_day |
| cutoff_reached | time, daily_total, dose_count |
| feedback_alertness | rating, time_of_day, current_level |
| feedback_sleep | rating, bedtime_caffeine |
| feedback_side_effect | type, time_of_day, current_level |
| device_connected | — |
| device_disconnected | duration_connected |
| cartridge_low | percent_remaining |
| app_opened | time_since_last_open |
| curve_interacted | tap_time_position |

---

## 9. App Store Metadata

### 9.1 Category
Health & Fitness

### 9.2 Subtitle
"Precision Caffeine Optimizer"

### 9.3 Description Framework
- Lead with the problem (coffee crashes, inconsistent energy)
- Show the solution (smart micro-dosing, personalized to your body)
- Social proof (backed by pharmacokinetic science, 2B-Alert military research lineage)
- Features list
- Safety and privacy commitment

### 9.4 Required Permissions
- Bluetooth (BLE device communication)
- Notifications (dose reminders, status alerts)
- HealthKit / Health Connect (sleep data, optional)

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| App launch to interactive | < 2 seconds |
| Curve render after dose | < 200ms |
| BLE command to pump start | < 500ms |
| API response (local network) | < 300ms |
| App bundle size | < 30MB |
| Battery impact (background BLE) | < 3% per hour |
| Crash-free rate | > 99.5% |
| Frame rate during chart interaction | 60fps constant |
