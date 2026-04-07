/**
 * Hook for fetching the predicted caffeine concentration curve.
 * GET /user/curve
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { CurveResponse } from "./types";

export function useCurve(userId: string | null) {
  return useQuery({
    queryKey: ["curve", userId],
    queryFn: () => apiFetch<CurveResponse>(`/user/curve?user_id=${userId}`),
    enabled: !!userId,
    refetchInterval: 5 * 60_000,
  });
}
