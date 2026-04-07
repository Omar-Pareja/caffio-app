/**
 * Hook for fetching hardware device status from the server.
 * GET /device/status
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { DeviceStatusResponse } from "./types";

export function useDeviceStatus() {
  return useQuery({
    queryKey: ["device-status"],
    queryFn: () => apiFetch<DeviceStatusResponse>("/device/status"),
    refetchInterval: 30_000,
  });
}
