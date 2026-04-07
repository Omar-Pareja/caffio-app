/**
 * Hook for confirming a dispensed dose.
 * POST /dose/confirm
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { DoseConfirmPayload, DoseConfirmResponse } from "./types";

export function useDoseConfirm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoseConfirmPayload) =>
      apiFetch<DoseConfirmResponse>("/dose/confirm", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curve"] });
    },
  });
}
