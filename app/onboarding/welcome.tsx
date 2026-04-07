import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useSessionStore } from "@/lib/store/useSessionStore";

export default function WelcomeScreen() {
  const setStep = useSessionStore((s) => s.setOnboardingStep);

  const handleStart = () => {
    setStep("profile");
    router.push("/onboarding/profile-setup");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Curve illustration placeholder */}
        <View className="mb-8 items-center">
          <View className="mb-6 h-32 w-64 items-center justify-center rounded-2xl bg-surface">
            <Text className="text-accent-primary font-bricolage text-3xl">
              ∿∿∿
            </Text>
            <Text className="text-text-muted font-inter text-xs mt-2">
              Smooth, steady caffeine levels
            </Text>
          </View>
        </View>

        <Text className="text-text-primary font-dm-sans-semibold text-3xl text-center mb-3">
          Optimize Your{"\n"}Caffeine
        </Text>

        <Text className="text-text-secondary font-inter text-base text-center mb-12 leading-6">
          Replace the coffee spike-and-crash cycle with smooth,
          consistent energy — calibrated to your body and sleep.
        </Text>

        <Button
          label="Get Started"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleStart}
        />

        <Text className="text-text-muted font-inter text-xs text-center mt-6">
          Caffio is a wellness tool, not a medical device.
        </Text>
      </View>
    </SafeAreaView>
  );
}
