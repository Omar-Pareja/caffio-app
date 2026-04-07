/**
 * API request/response types matching the caffio-engine FastAPI backend.
 * These are the contracts between app and server.
 */

// ── User Profile ──────────────────────────────────────────────

export type Sex = "male" | "female";
export type Genotype = "AA" | "AC" | "CC" | "unknown";

export interface UserProfile {
  user_id: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: Sex;
  genotype: Genotype;
  smoking: boolean;
  wake_time: string;
  bed_time: string;
  target_level_mg_l: number;
  bedtime_threshold_mg_l: number;
  daily_caffeine_estimate_mg: number;
  medications: string[];
  conditions: string[];
}

// ── Dose Request / Response ───────────────────────────────────

export interface DoseRequestPayload {
  user_id: string;
  timestamp: string;
}

export interface DoseResponse {
  approved: boolean;
  dose_id: string;
  amount_mg: number;
  reason: string;
  predicted_peak_mg_l: number;
  predicted_bedtime_mg_l: number;
}

// ── Dose Confirm ──────────────────────────────────────────────

export interface DoseConfirmPayload {
  dose_id: string;
  actual_amount_mg: number;
  timestamp: string;
  source: "device" | "manual";
}

export interface DoseConfirmResponse {
  confirmed: boolean;
  daily_total_mg: number;
}

// ── Dose Skip ─────────────────────────────────────────────────

export interface DoseSkipPayload {
  dose_id: string;
  timestamp: string;
}

// ── Schedule ──────────────────────────────────────────────────

export interface ScheduleRequestPayload {
  user_id: string;
  date: string;
}

export type ScheduledDoseStatus = "upcoming" | "taken" | "skipped";

export interface ScheduledDose {
  dose_id: string;
  time: string;
  amount_mg: number;
  status: ScheduledDoseStatus;
}

export interface ScheduleResponse {
  date: string;
  doses: ScheduledDose[];
  total_mg: number;
  cutoff_time: string;
}

// ── Curve ─────────────────────────────────────────────────────

export interface CurvePoint {
  time: string;
  hour: number;
  concentration_mg_l: number;
  upper_bound: number;
  lower_bound: number;
}

export interface CurveResponse {
  user_id: string;
  date: string;
  points: CurvePoint[];
  target_level: number;
  bedtime_threshold: number;
}

// ── Feedback ──────────────────────────────────────────────────

export interface AlertnessFeedback {
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
}

export type SideEffectType =
  | "jitters"
  | "anxiety"
  | "heart_racing"
  | "gi_distress"
  | "headache"
  | "other";

export interface SideEffectFeedback {
  user_id: string;
  type: SideEffectType;
  timestamp: string;
  notes?: string;
}

export interface SleepFeedback {
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  caffeine_affected: boolean | null;
  timestamp: string;
}

// ── Device Status ─────────────────────────────────────────────

export interface DeviceStatusResponse {
  connected: boolean;
  cartridge_percent: number;
  pump_status: "ready" | "dispensing" | "error" | "empty";
  firmware_version: string;
  battery_percent: number;
}
