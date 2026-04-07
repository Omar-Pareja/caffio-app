/**
 * Hook for fetching hardware device status from the server.
 * GET /device/status
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { DeviceStatusResponse } from "./types";

export function useDeviceStatus(deviceId: string | null) {
  return useQuery({
    queryKey: ["device-status", deviceId],
    queryFn: () =>
      apiFetch<DeviceStatusResponse>(`/device/status?device_id=${deviceId}`),
    enabled: !!deviceId,
    refetchInterval: 30_000,
  });
}
