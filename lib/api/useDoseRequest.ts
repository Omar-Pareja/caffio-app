/**
 * Hook for requesting a new dose from the server.
 * POST /dose/request
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { DoseRequestPayload, DoseResponse } from "./types";

export function useDoseRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoseRequestPayload) =>
      apiFetch<DoseResponse>("/dose/request", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curve"] });
    },
  });
}
