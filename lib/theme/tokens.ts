/**
 * Caffio Design Tokens
 * Single source of truth for all visual design values.
 * These tokens mirror the Tailwind config for use in non-NativeWind contexts
 * (e.g., Victory Native XL chart props, Reanimated shared values).
 */

export const colors = {
  background: "#0A0A0B",
  surface: {
    DEFAULT: "#131316",
    elevated: "#1C1C21",
  },
  border: "#2A2A30",
  text: {
    primary: "#F5F5F7",
    secondary: "#8E8E93",
    muted: "#636366",
  },
  accent: {
    primary: "#4ECDC4",
    warning: "#FFB347",
    danger: "#FF6B6B",
    success: "#7ED321",
  },
  chart: {
    confidenceBand: "rgba(78, 205, 196, 0.18)",
    targetZone: "rgba(126, 211, 33, 0.08)",
  },
} as const;

export const fonts = {
  bricolage: "BricolageGrotesque",
  dmSans: "DMSans",
  dmSansSemiBold: "DMSans-SemiBold",
  inter: "Inter",
  interMedium: "Inter-Medium",
} as const;

export const fontSizes = {
  /** Metric display — caffeine level, dose amounts */
  metricLg: 64,
  metricMd: 48,
  /** Section headers */
  headerLg: 24,
  headerMd: 20,
  /** Body text */
  bodyLg: 16,
  bodyMd: 14,
  /** Labels and captions */
  caption: 12,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
} as const;
