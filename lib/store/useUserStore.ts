/**
 * User profile and PK parameters store.
 * Persisted to MMKV — survives app restarts.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorage } from "@/lib/storage";
import type { Sex, Genotype } from "@/lib/api/types";

interface UserState {
  userId: string | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  sex: Sex | null;
  genotype: Genotype;
  smoking: boolean;
  wakeTime: string;
  bedTime: string;
  targetLevelMgL: number;
  bedtimeThresholdMgL: number;
  dailyCaffeineEstimateMg: number;
  medications: string[];
  conditions: string[];
}

interface UserActions {
  setProfile: (profile: Partial<UserState>) => void;
  clearProfile: () => void;
}

const initialState: UserState = {
  userId: null,
  weightKg: null,
  heightCm: null,
  age: null,
  sex: null,
  genotype: "unknown",
  smoking: false,
  wakeTime: "07:00",
  bedTime: "23:00",
  targetLevelMgL: 3.0,
  bedtimeThresholdMgL: 1.0,
  dailyCaffeineEstimateMg: 200,
  medications: [],
  conditions: [],
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set((s) => ({ ...s, ...profile })),

      clearProfile: () => set(initialState),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
