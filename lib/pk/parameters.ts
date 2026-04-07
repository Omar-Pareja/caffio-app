/**
 * Pharmacokinetic constants and parameter derivation.
 * Mirrors caffio-engine's pk_parameters.py exactly.
 *
 * These defaults come from published caffeine PK literature:
 * - Absorption rate (ka): ~2.0/hr (rapid oral absorption)
 * - Elimination half-life: ~5h for average (CYP1A2 AA genotype)
 * - Volume of distribution: ~0.6-0.7 L/kg body weight
 * - Bioavailability: ~99% (caffeine is almost fully absorbed)
 */

import type { Genotype } from "@/lib/api/types";

/** Half-life in hours by CYP1A2 genotype */
const HALF_LIFE_BY_GENOTYPE: Record<Genotype, number> = {
  AA: 5.0,
  AC: 6.5,
  CC: 8.0,
  unknown: 5.5,
};

/** Smoking reduces caffeine half-life by ~30-50% */
const SMOKER_HALF_LIFE_FACTOR = 0.65;

/** Default absorption rate constant (1/hr) */
const DEFAULT_KA = 2.0;

/** Default bioavailability fraction */
const DEFAULT_BIOAVAILABILITY = 0.99;

/** Default Vd coefficient (L per kg body weight) */
const VD_PER_KG = 0.6;

export interface PKParameters {
  /** Absorption rate constant (1/hr) */
  ka: number;
  /** Elimination rate constant (1/hr) — derived from half-life */
  ke: number;
  /** Volume of distribution (L) */
  vd: number;
  /** Oral bioavailability (0–1) */
  bioavailability: number;
  /** Elimination half-life (hr) */
  halfLife: number;
}

/**
 * Derive PK parameters from a user profile.
 * This is the same calculation the Python engine performs.
 */
export function derivePKParameters(profile: {
  weightKg: number;
  genotype: Genotype;
  smoking: boolean;
}): PKParameters {
  let halfLife = HALF_LIFE_BY_GENOTYPE[profile.genotype];

  if (profile.smoking) {
    halfLife *= SMOKER_HALF_LIFE_FACTOR;
  }

  const ke = Math.LN2 / halfLife;
  const vd = VD_PER_KG * profile.weightKg;

  return {
    ka: DEFAULT_KA,
    ke,
    vd,
    bioavailability: DEFAULT_BIOAVAILABILITY,
    halfLife,
  };
}

/** Fallback parameters for a 70kg non-smoker with unknown genotype */
export const DEFAULT_PK: PKParameters = derivePKParameters({
  weightKg: 70,
  genotype: "unknown",
  smoking: false,
});
