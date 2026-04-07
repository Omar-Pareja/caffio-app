import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSessionStore } from "@/lib/store/useSessionStore";

export default function DeviceSetupScreen() {
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const handleSetup = () => {
    // BLE pairing will be implemented in Phase 4
    // For now, show the calibration notice and complete
    completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-between">
        <View className="mt-6">
          <Text className="text-text-primary font-dm-sans-semibold text-2xl mb-2">
            Connect Your Device
          </Text>
          <Text className="text-text-secondary font-inter text-sm mb-8">
            Pair your Caffio dispenser to enable automatic dosing.
          </Text>

          {/* Device scan area */}
          <Card className="items-center py-12 mb-6">
            <View className="h-20 w-20 rounded-full bg-surface-elevated items-center justify-center mb-4">
              <Text className="text-accent-primary text-3xl">📡</Text>
            </View>
            <Text className="text-text-primary font-dm-sans-semibold text-base mb-1">
              Searching for devices...
            </Text>
            <Text className="text-text-muted font-inter text-sm text-center">
              Make sure your Caffio device is powered on{"\n"}and within Bluetooth range.
            </Text>
          </Card>

          {/* Calibration notice */}
          <Card elevated className="mb-6">
            <Text className="text-text-primary font-dm-sans-semibold text-sm mb-2">
              Calibration Period
            </Text>
            <Text className="text-text-secondary font-inter text-sm leading-5">
              Your first 7–14 days are a calibration period. Doses may be
              conservative while the system learns your body. It gets smarter
              every day.
            </Text>
          </Card>
        </View>

        <View className="pb-8 gap-3">
          <Button
            label="Set Up Device"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSetup}
          />
          <Button
            label="Skip for Now"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={handleSkip}
          />
          <Text className="text-text-muted font-inter text-xs text-center">
            You can pair a device later from Settings.{"\n"}
            The app works without hardware in simulation mode.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
