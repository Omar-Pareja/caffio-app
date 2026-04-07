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
  FeedbackResponse,
} from "./types";

export function useAlertnessFeedback() {
  return useMutation({
    mutationFn: (payload: AlertnessFeedback) =>
      apiFetch<FeedbackResponse>("/feedback/alertness", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useSideEffectFeedback() {
  return useMutation({
    mutationFn: (payload: SideEffectFeedback) =>
      apiFetch<FeedbackResponse>("/feedback/side-effect", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useSleepFeedback() {
  return useMutation({
    mutationFn: (payload: SleepFeedback) =>
      apiFetch<FeedbackResponse>("/feedback/sleep", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
