/** API base URL — override with EXPO_PUBLIC_API_URL env variable */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

/** Caffio BLE Service UUID */
export const CAFFIO_SERVICE_UUID = "00000001-cafe-f10-0000-000000000000";

/** BLE Characteristic UUIDs */
export const BLE_CHARACTERISTICS = {
  DOSE_COMMAND: "00000002-cafe-f10-0000-000000000000",
  DOSE_CONFIRMATION: "00000003-cafe-f10-0000-000000000000",
  CARTRIDGE_LEVEL: "00000004-cafe-f10-0000-000000000000",
  DEVICE_STATUS: "00000005-cafe-f10-0000-000000000000",
  FIRMWARE_VERSION: "00000006-cafe-f10-0000-000000000000",
} as const;

/** BLE reconnection settings */
export const BLE_RECONNECT = {
  MAX_RETRIES: 5,
  BASE_DELAY_MS: 1000,
} as const;

/** PK model defaults */
export const PK_DEFAULTS = {
  BEDTIME_THRESHOLD_MG_L: 1.0,
  CONCENTRATION_CEILING_MG_L: 8.0,
  DEFAULT_TARGET_MG_L: 3.0,
} as const;

/** App timing */
export const TIMING = {
  CURVE_UPDATE_INTERVAL_MS: 5 * 60 * 1000,
  MIN_DOSE_INTERVAL_MS: 30 * 60 * 1000,
  TOAST_DISMISS_MS: 4000,
} as const;
