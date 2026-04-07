/**
 * App session state — onboarding progress, UI preferences, auth.
 * Persisted to MMKV.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorage } from "@/lib/storage";

type OnboardingStep =
  | "welcome"
  | "profile"
  | "health"
  | "preferences"
  | "device"
  | "calibration"
  | "complete";

type DosingMode = "on-demand" | "scheduled";

interface SessionState {
  onboardingStep: OnboardingStep;
  onboardingComplete: boolean;
  dosingMode: DosingMode;
  disclaimerAccepted: boolean;
  /** Whether the dose log on the home screen is expanded */
  doseLogExpanded: boolean;
}

interface SessionActions {
  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  resetSession: () => void;
  setDosingMode: (mode: DosingMode) => void;
  acceptDisclaimer: () => void;
  toggleDoseLog: () => void;
}

const initialState: SessionState = {
  onboardingStep: "welcome",
  onboardingComplete: false,
  dosingMode: "on-demand",
  disclaimerAccepted: false,
  doseLogExpanded: false,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      completeOnboarding: () =>
        set({ onboardingStep: "complete", onboardingComplete: true }),

      resetSession: () => set(initialState),

      setDosingMode: (mode) => set({ dosingMode: mode }),

      acceptDisclaimer: () => set({ disclaimerAccepted: true }),

      toggleDoseLog: () => set((s) => ({ doseLogExpanded: !s.doseLogExpanded })),
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
