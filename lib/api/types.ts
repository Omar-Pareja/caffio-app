/**
 * API request/response types matching the caffio-engine FastAPI backend.
 * These mirror the Pydantic models in caffio_engine/integration/api.py.
 */

// ── User Profile ──────────────────────────────────────────────

export type Sex = "male" | "female";
export type Genotype = "AA" | "AC" | "CC" | "unknown";

/** PUT /user/profile — request body (matches UserProfileRequest) */
export interface UserProfilePayload {
  user_id: string;
  weight_kg: number;
  height_cm?: number;
  age: number;
  sex: Sex;
  smoking_status?: boolean;
  oral_contraceptive?: boolean;
  genotype?: Genotype;
  medications?: string[];
  pregnancy?: boolean;
  liver_disease?: boolean;
  cardiac_condition?: boolean;
  seizure_disorder?: boolean;
  habitual_caffeine_mg_per_day?: number;
  wake_time?: string;
  bed_time?: string;
}

/** PUT /user/profile — response */
export interface UserProfileResponse {
  status: string;
}

// ── Dose Request / Response ───────────────────────────────────

/** POST /dose/request — request body (matches DoseRequest) */
export interface DoseRequestPayload {
  user_id: string;
  target_mg_l?: number;
  bed_time?: string | null;
}

/** POST /dose/request — response (matches DoseResponse) */
export interface DoseResponse {
  amount_mg: number;
  reason: string;
  denied: boolean;
}

// ── Dose Log (external drinks) ───────────────────────────────

/** POST /dose/log — request body */
export interface DoseLogPayload {
  user_id: string;
  amount_mg: number;
  formulation: "coffee" | "tea" | "energy_drink";
}

/** POST /dose/log — response */
export interface DoseLogResponse {
  status: string;
  dose_id: string;
}

// ── Dose Confirm ──────────────────────────────────────────────

/** POST /dose/confirm — request body (matches ConfirmRequest) */
export interface DoseConfirmPayload {
  dose_id: number;
}

/** POST /dose/confirm — response */
export interface DoseConfirmResponse {
  status: string;
}

// ── Dose Skip ─────────────────────────────────────────────────

/** POST /dose/skip — request body (matches SkipRequest) */
export interface DoseSkipPayload {
  dose_id: number;
}

/** POST /dose/skip — response */
export interface DoseSkipResponse {
  status: string;
  dose_id: string;
}

// ── Schedule ──────────────────────────────────────────────────

/** POST /schedule/generate — request body (matches ScheduleRequest) */
export interface ScheduleRequestPayload {
  user_id: string;
  target_mg_l?: number;
  dose_mg?: number;
  interval_min?: number;
}

/** A single dose in the schedule response (matches ScheduleDoseItem) */
export interface ScheduledDose {
  amount_mg: number;
  time: string;
  formulation: string;
}

/** POST /schedule/generate — response (matches ScheduleResponse) */
export interface ScheduleResponse {
  doses: ScheduledDose[];
  daily_total_mg: number;
  target_mg_l: number;
}

// ── Curve ─────────────────────────────────────────────────────

/** A single point on the curve (matches CurvePoint) */
export interface CurvePoint {
  time: string;
  point_estimate: number;
  lower_bound: number;
  upper_bound: number;
}

/** GET /user/curve — response (matches CurveResponse) */
export interface CurveResponse {
  points: CurvePoint[];
}

// ── Feedback ──────────────────────────────────────────────────

/** POST /feedback/alertness — request body (matches AlertnessRequest) */
export interface AlertnessFeedback {
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

/** POST /feedback/side-effect — request body (matches SideEffectRequest) */
export type SideEffectType =
  | "jitters"
  | "anxiety"
  | "heart_racing"
  | "gi_distress"
  | "headache"
  | "other";

export interface SideEffectFeedback {
  user_id: string;
  side_effect: SideEffectType;
  notes?: string;
}

/** POST /feedback/sleep — request body (matches SleepRequest) */
export interface SleepFeedback {
  user_id: string;
  date: string;
  bed_time: string;
  wake_time: string;
  quality_rating?: number | null;
  total_sleep_min?: number | null;
  source?: string;
}

/** Generic feedback response (all feedback endpoints return this) */
export interface FeedbackResponse {
  status: string;
}

// ── Device Status ─────────────────────────────────────────────

/** GET /device/status — response (matches DeviceStatusResponse) */
export interface DeviceStatusResponse {
  status: string;
  cartridge_level_mg: number;
  max_single_dose_mg: number;
}
