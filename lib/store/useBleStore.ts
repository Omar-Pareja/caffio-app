/**
 * BLE connection state store.
 * All BLE state lives here — components read from this store,
 * only lib/ble/ writes to it.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorage } from "@/lib/storage";

type ConnectionState = "disconnected" | "scanning" | "connecting" | "connected";
type PumpStatus = "ready" | "dispensing" | "error" | "empty";

interface BleState {
  connectionState: ConnectionState;
  /** Bonded device ID stored across restarts */
  bondedDeviceId: string | null;
  deviceName: string | null;
  cartridgePercent: number;
  pumpStatus: PumpStatus;
  firmwareVersion: string | null;
  batteryPercent: number;
  /** Reconnection tracking */
  reconnectAttempts: number;
  lastError: string | null;
}

interface BleActions {
  setConnectionState: (state: ConnectionState) => void;
  setBondedDevice: (deviceId: string, name: string) => void;
  clearBondedDevice: () => void;
  updateDeviceInfo: (info: Partial<Pick<BleState, "cartridgePercent" | "pumpStatus" | "firmwareVersion" | "batteryPercent">>) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
  setError: (error: string | null) => void;
}

const initialState: BleState = {
  connectionState: "disconnected",
  bondedDeviceId: null,
  deviceName: null,
  cartridgePercent: 0,
  pumpStatus: "ready",
  firmwareVersion: null,
  batteryPercent: 100,
  reconnectAttempts: 0,
  lastError: null,
};

export const useBleStore = create<BleState & BleActions>()(
  persist(
    (set) => ({
      ...initialState,

      setConnectionState: (connectionState) => set({ connectionState }),

      setBondedDevice: (deviceId, name) =>
        set({
          bondedDeviceId: deviceId,
          deviceName: name,
          connectionState: "connected",
          reconnectAttempts: 0,
          lastError: null,
        }),

      clearBondedDevice: () =>
        set({
          bondedDeviceId: null,
          deviceName: null,
          connectionState: "disconnected",
        }),

      updateDeviceInfo: (info) => set((s) => ({ ...s, ...info })),

      incrementReconnect: () =>
        set((s) => ({ reconnectAttempts: s.reconnectAttempts + 1 })),

      resetReconnect: () => set({ reconnectAttempts: 0, lastError: null }),

      setError: (error) => set({ lastError: error }),
    }),
    {
      name: "ble-store",
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        bondedDeviceId: state.bondedDeviceId,
        deviceName: state.deviceName,
      }),
    },
  ),
);
