/**
 * Hook for logging an external caffeine drink.
 * POST /dose/log
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { DoseLogPayload, DoseLogResponse } from "./types";

export function useDoseLog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoseLogPayload) =>
      apiFetch<DoseLogResponse>("/dose/log", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curve"] });
    },
  });
}
