/**
 * Mock data for the home screen.
 * Generates a realistic Bateman caffeine curve with multiple doses.
 */

/** Simple single-dose Bateman equation */
function batemanDose(
  t: number,
  doseMg: number,
  tDose: number,
  ka: number,
  ke: number,
  vd: number,
  bioavailability: number,
): number {
  const dt = t - tDose;
  if (dt < 0) return 0;
  const coeff = (bioavailability * doseMg * ka) / (vd * (ka - ke));
  return coeff * (Math.exp(-ke * dt) - Math.exp(-ka * dt));
}

/** PK parameters for a ~65kg average metabolizer */
const PK = {
  ka: 2.0,
  ke: 0.12,
  vd: 25,
  bioavailability: 0.99,
};

/** Mock dose schedule for today */
export const mockDoses = [
  { hour: 7.5, mg: 60, label: "Morning boost" },
  { hour: 9.5, mg: 40, label: "Mid-morning" },
  { hour: 11.5, mg: 30, label: "Pre-lunch" },
  { hour: 13.5, mg: 30, label: "Afternoon" },
  { hour: 15.0, mg: 30, label: "Late afternoon" },
];

/** Generate the full caffeine curve from 7am to 11pm */
function generateCurve(): Array<{ [key: string]: number; hour: number; level: number; upper: number; lower: number }> {
  const points: Array<{ [key: string]: number; hour: number; level: number; upper: number; lower: number }> = [];
  const startHour = 7;
  const endHour = 23;
  const step = 0.25; // 15-minute intervals

  for (let h = startHour; h <= endHour; h += step) {
    let total = 0;
    for (const dose of mockDoses) {
      total += batemanDose(h, dose.mg, dose.hour, PK.ka, PK.ke, PK.vd, PK.bioavailability);
    }

    // Clamp and round
    const level = Math.max(0, Math.round(total * 100) / 100);
    const uncertainty = level * 0.2;

    points.push({
      hour: Math.round(h * 100) / 100,
      level,
      upper: Math.round((level + uncertainty) * 100) / 100,
      lower: Math.round(Math.max(0, level - uncertainty) * 100) / 100,
    });
  }

  return points;
}

export const mockCurveData = generateCurve();

/** Dose markers positioned on the curve */
export const mockDoseMarkers = mockDoses.map((dose) => {
  const point = mockCurveData.find(
    (p) => Math.abs(p.hour - dose.hour) < 0.15,
  );
  return {
    hour: dose.hour,
    mg: dose.mg,
    level: point?.level ?? 0,
  };
});

/** Current simulated state */
export const mockCurrentHour = 14.5;

export const mockDailyStats = {
  dailyTotal: mockDoses.reduce((sum, d) => sum + d.mg, 0),
  dailyLimit: 399,
  doseCount: mockDoses.length,
  cutoffTime: "3:30 PM",
};

/** Derive the displayed metric from the curve at the current time */
const currentPoint = mockCurveData.find(
  (p) => Math.abs(p.hour - mockCurrentHour) < 0.15,
);

export const mockMetric = {
  value: currentPoint ? currentPoint.level.toFixed(1) : "3.1",
  unit: "mg/L",
  trend: "falling" as const,
  status: "inZone" as const,
};

export const mockDevice = {
  connected: true,
  cartridgePercent: 72,
};
