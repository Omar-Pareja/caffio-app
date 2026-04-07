import "../global.css";

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/client";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useDoseStore } from "@/lib/store/useDoseStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("@/assets/fonts/Inter.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    DMSans: require("@/assets/fonts/DMSans.ttf"),
    "DMSans-SemiBold": require("@/assets/fonts/DMSans-SemiBold.ttf"),
    BricolageGrotesque: require("@/assets/fonts/BricolageGrotesque.ttf"),
  });

  const onboardingComplete = useSessionStore((s) => s.onboardingComplete);
  const resetIfNewDay = useDoseStore((s) => s.resetIfNewDay);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Reset dose store on new day
  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  // Redirect based on onboarding state
  useEffect(() => {
    if (!fontsLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding/welcome");
    } else if (onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [fontsLoaded, onboardingComplete, segments, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0A0B" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="device" />
      </Stack>
    </QueryClientProvider>
  );
}
