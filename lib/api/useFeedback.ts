/**
 * Hooks for submitting user feedback to the adaptation engine.
 * POST /feedback/alertness, /feedback/side-effect, /feedback/sleep
 */

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  AlertnessFeedback,
  SideEffectFeedback,
  SleepFeedback,
} from "./types";

export function useAlertnessFeedback() {
  return useMutation({
    mutationFn: (payload: AlertnessFeedback) =>
      apiFetch<{ received: boolean }>("/feedback/alertness", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useSideEffectFeedback() {
  return useMutation({
    mutationFn: (payload: SideEffectFeedback) =>
      apiFetch<{ received: boolean }>("/feedback/side-effect", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useSleepFeedback() {
  return useMutation({
    mutationFn: (payload: SleepFeedback) =>
      apiFetch<{ received: boolean }>("/feedback/sleep", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
