/**
 * TypeScript mirror of the Bateman equation for caffeine concentration.
 * Used for instant local curve prediction — never wait for API to redraw.
 *
 * C(t) = (F · D · ka) / (Vd · (ka - ke)) · (e^(-ke·Δt) - e^(-ka·Δt))
 *
 * where:
 *   F  = bioavailability
 *   D  = dose in mg
 *   ka = absorption rate constant (1/hr)
 *   ke = elimination rate constant (1/hr)
 *   Vd = volume of distribution (L)
 *   Δt = time since dose (hr), must be ≥ 0
 */

import type { PKParameters } from "./parameters";

export interface DoseEvent {
  /** Time the dose was taken, in fractional hours from midnight (e.g. 7.5 = 7:30 AM) */
  timeHr: number;
  /** Dose amount in mg */
  amountMg: number;
}

/**
 * Calculate concentration contribution from a single dose at time t.
 * Returns mg/L.
 */
export function singleDoseConcentration(
  t: number,
  dose: DoseEvent,
  pk: PKParameters,
): number {
  const dt = t - dose.timeHr;
  if (dt < 0) return 0;

  const { ka, ke, vd, bioavailability } = pk;
  const coeff = (bioavailability * dose.amountMg * ka) / (vd * (ka - ke));
  return coeff * (Math.exp(-ke * dt) - Math.exp(-ka * dt));
}

/**
 * Calculate total caffeine concentration at time t from multiple doses.
 * Caffeine PK is linear — concentrations from individual doses add up.
 */
export function totalConcentration(
  t: number,
  doses: DoseEvent[],
  pk: PKParameters,
): number {
  let total = 0;
  for (const dose of doses) {
    total += singleDoseConcentration(t, dose, pk);
  }
  return Math.max(0, total);
}

/**
 * Time to peak concentration after a single dose (hours).
 * tmax = ln(ka/ke) / (ka - ke)
 */
export function timeToPeak(pk: PKParameters): number {
  return Math.log(pk.ka / pk.ke) / (pk.ka - pk.ke);
}

/**
 * Peak concentration from a single dose (mg/L).
 */
export function peakConcentration(dose: DoseEvent, pk: PKParameters): number {
  const tPeak = dose.timeHr + timeToPeak(pk);
  return singleDoseConcentration(tPeak, dose, pk);
}
