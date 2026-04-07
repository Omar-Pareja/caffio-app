/**
 * Hook for creating/updating the user profile.
 * PUT /user/profile
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { UserProfilePayload, UserProfileResponse } from "./types";

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (profile: UserProfilePayload) =>
      apiFetch<UserProfileResponse>("/user/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curve"] });
    },
  });
}
