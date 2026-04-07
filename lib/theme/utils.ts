/**
 * Theme utility functions for dynamic styling contexts
 * (charts, Reanimated animations, etc.)
 */

import { colors } from "./tokens";

/** Returns the accent color for a given caffeine status */
export function getStatusColor(
  status: "inZone" | "buildingUp" | "windingDown" | "complete"
): string {
  switch (status) {
    case "inZone":
      return colors.accent.success;
    case "buildingUp":
      return colors.accent.warning;
    case "windingDown":
      return colors.accent.primary;
    case "complete":
      return colors.text.muted;
  }
}

/** Returns a color with adjusted opacity (for chart layers) */
export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
