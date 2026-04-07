/**
 * Full curve prediction for the UI chart.
 * Generates an array of concentration points from wake to bed time,
 * including confidence bands.
 */

import type { PKParameters } from "./parameters";
import { totalConcentration, type DoseEvent } from "./bateman";

export interface CurvePoint {
  /** Fractional hour from midnight */
  hour: number;
  /** Predicted concentration (mg/L) */
  level: number;
  /** Upper confidence bound */
  upper: number;
  /** Lower confidence bound */
  lower: number;
  /** Index signature for Victory Native XL compatibility */
  [key: string]: number;
}

interface CurveOptions {
  /** Start hour (fractional, default: 7.0 = 7:00 AM) */
  startHour?: number;
  /** End hour (fractional, default: 23.0 = 11:00 PM) */
  endHour?: number;
  /** Time step in hours (default: 0.25 = 15 min) */
  stepHr?: number;
  /** Uncertainty band width as fraction of level (default: 0.2 = ±20%) */
  uncertaintyFraction?: number;
}

/**
 * Generate a full predicted caffeine curve.
 * Called locally for instant UI updates after a dose event.
 */
export function generateCurve(
  doses: DoseEvent[],
  pk: PKParameters,
  options: CurveOptions = {},
): CurvePoint[] {
  const {
    startHour = 7,
    endHour = 23,
    stepHr = 0.25,
    uncertaintyFraction = 0.2,
  } = options;

  const points: CurvePoint[] = [];

  for (let h = startHour; h <= endHour; h += stepHr) {
    const level = totalConcentration(h, doses, pk);
    const band = level * uncertaintyFraction;

    points.push({
      hour: Math.round(h * 100) / 100,
      level: Math.round(level * 100) / 100,
      upper: Math.round((level + band) * 100) / 100,
      lower: Math.round(Math.max(0, level - band) * 100) / 100,
    });
  }

  return points;
}

/**
 * Predict concentration at a specific future time.
 * Used for dose decision UI ("if you take X mg, you'll be at Y by bedtime").
 */
export function predictAtTime(
  targetHour: number,
  doses: DoseEvent[],
  pk: PKParameters,
): number {
  return totalConcentration(targetHour, doses, pk);
}

/**
 * Find the time when concentration drops below a threshold.
 * Used for calculating dosing cutoff time (bedtime protection).
 */
export function timeToThreshold(
  doses: DoseEvent[],
  pk: PKParameters,
  thresholdMgL: number,
  startSearchHour: number,
  endSearchHour: number,
): number | null {
  const step = 0.1;
  let prevLevel = totalConcentration(startSearchHour, doses, pk);

  for (let h = startSearchHour + step; h <= endSearchHour; h += step) {
    const level = totalConcentration(h, doses, pk);
    if (prevLevel >= thresholdMgL && level < thresholdMgL) {
      return Math.round(h * 10) / 10;
    }
    prevLevel = level;
  }

  return null;
}
