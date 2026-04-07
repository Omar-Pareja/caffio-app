/**
 * API client configuration.
 * Central fetch wrapper and TanStack Query client instance.
 */

import { QueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/constants/config";

/** Shared QueryClient — configure stale times for health-app patterns */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/** Typed API error */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

/**
 * Thin fetch wrapper — all API hooks call this.
 * Handles JSON serialization, base URL, and error normalization.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}
