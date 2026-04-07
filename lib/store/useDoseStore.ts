/**
 * Today's dose state — tracks doses taken, daily totals, and pending queue.
 * Persisted to MMKV so state survives app backgrounding.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorage } from "@/lib/storage";

export type DrinkFormulation = "caffio" | "coffee" | "tea" | "energy_drink";

export interface DoseRecord {
  doseId: string;
  amountMg: number;
  timestamp: string;
  source: "device" | "manual";
  confirmed: boolean;
  /** Drink type — "caffio" for device doses, others for logged external drinks */
  formulation?: DrinkFormulation;
}

interface DoseState {
  /** Today's date string (YYYY-MM-DD), used to reset on new day */
  date: string;
  doses: DoseRecord[];
  dailyTotalMg: number;
  dailyLimitMg: number;
  cutoffTime: string | null;
  /** Doses taken offline that haven't been confirmed with server */
  pendingSync: DoseRecord[];
}

interface DoseActions {
  addDose: (dose: DoseRecord) => void;
  confirmDose: (doseId: string) => void;
  setDailyLimit: (limitMg: number) => void;
  setCutoffTime: (time: string) => void;
  queueForSync: (dose: DoseRecord) => void;
  clearSynced: (doseIds: string[]) => void;
  resetIfNewDay: () => void;
  /** Clear all doses — used when a new profile is created during onboarding */
  clearAll: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const initialState: DoseState = {
  date: todayStr(),
  doses: [],
  dailyTotalMg: 0,
  dailyLimitMg: 400,
  cutoffTime: null,
  pendingSync: [],
};

export const useDoseStore = create<DoseState & DoseActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addDose: (dose) =>
        set((s) => ({
          doses: [...s.doses, dose],
          dailyTotalMg: s.dailyTotalMg + dose.amountMg,
        })),

      confirmDose: (doseId) =>
        set((s) => ({
          doses: s.doses.map((d) =>
            d.doseId === doseId ? { ...d, confirmed: true } : d,
          ),
          pendingSync: s.pendingSync.filter((d) => d.doseId !== doseId),
        })),

      setDailyLimit: (limitMg) => set({ dailyLimitMg: limitMg }),

      setCutoffTime: (time) => set({ cutoffTime: time }),

      queueForSync: (dose) =>
        set((s) => ({ pendingSync: [...s.pendingSync, dose] })),

      clearSynced: (doseIds) =>
        set((s) => ({
          pendingSync: s.pendingSync.filter(
            (d) => !doseIds.includes(d.doseId),
          ),
        })),

      resetIfNewDay: () => {
        const today = todayStr();
        if (get().date !== today) {
          set({ ...initialState, date: today });
        }
      },

      clearAll: () => set({ ...initialState, date: todayStr() }),
    }),
    {
      name: "dose-store",
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
