/**
 * Hook for generating a full-day dose schedule.
 * POST /schedule/generate
 */

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { ScheduleRequestPayload, ScheduleResponse } from "./types";

export function useScheduleGenerate() {
  return useMutation({
    mutationFn: (payload: ScheduleRequestPayload) =>
      apiFetch<ScheduleResponse>("/schedule/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
