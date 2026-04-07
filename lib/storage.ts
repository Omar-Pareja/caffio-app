/**
 * Async local persistence via AsyncStorage.
 * Used by Zustand persist middleware for all stores.
 *
 * NOTE: Using AsyncStorage for Expo Go compatibility.
 * Switch to react-native-mmkv when moving to development builds
 * for synchronous, faster storage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

export const asyncStorage: StateStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};
