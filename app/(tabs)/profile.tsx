import { useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/lib/store/useUserStore";
import { useBleStore } from "@/lib/store/useBleStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useUpdateProfile } from "@/lib/api/useUserProfile";
import { derivePKParameters, DEFAULT_PK } from "@/lib/pk/parameters";
import type { Sex, Genotype, UserProfilePayload } from "@/lib/api/types";

const GENOTYPE_LABELS: Record<string, string> = {
  AA: "Fast metabolizer",
  AC: "Normal metabolizer",
  CC: "Slow metabolizer",
  unknown: "Unknown",
};

interface ProfileFields {
  userId: string | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  sex: Sex | null;
  genotype: Genotype;
  smoking: boolean;
  medications: string[];
  dailyCaffeineEstimateMg: number;
  wakeTime: string;
  bedTime: string;
}

/** Build server payload from local user store */
function buildProfilePayload(user: ProfileFields): UserProfilePayload | null {
  if (!user.userId || !user.weightKg || !user.age || !user.sex) return null;
  return {
    user_id: user.userId,
    weight_kg: user.weightKg,
    height_cm: user.heightCm ?? undefined,
    age: user.age,
    sex: user.sex,
    smoking_status: user.smoking,
    genotype: user.genotype,
    medications: user.medications,
    habitual_caffeine_mg_per_day: user.dailyCaffeineEstimateMg,
    wake_time: user.wakeTime,
    bed_time: user.bedTime,
  };
}

export default function ProfileScreen() {
  const user = useUserStore();
  const ble = useBleStore();
  const session = useSessionStore();
  const updateProfile = useUpdateProfile();

  const pk = user.weightKg
    ? derivePKParameters({
        weightKg: user.weightKg,
        genotype: user.genotype,
        smoking: user.smoking,
      })
    : DEFAULT_PK;

  /** Reset all state and go back to onboarding (testing only) */
  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      "Reset Onboarding",
      "This will clear all your data and restart onboarding. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            user.clearProfile();
            session.resetSession();
            router.replace("/onboarding/welcome");
          },
        },
      ],
    );
  }, [user, session]);

  /** Update a dosing target locally and sync to server */
  const handleTargetChange = useCallback(
    (key: "targetLevelMgL" | "bedtimeThresholdMgL", value: number) => {
      user.setProfile({ [key]: value });

      // Sync to server in the background
      const payload = buildProfilePayload(user);
      if (payload) {
        updateProfile.mutate(payload);
      }
    },
    [user, updateProfile],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-text-primary font-dm-sans-semibold text-xl py-3">
          Profile & Settings
        </Text>

        {/* Sync status indicator */}
        {updateProfile.isPending && (
          <View className="mb-2 px-1">
            <Text className="text-text-muted font-inter text-xs">Syncing...</Text>
          </View>
        )}

        {/* Profile summary */}
        <Card className="mb-3 gap-3">
          <Text className="text-text-secondary font-dm-sans text-sm">
            Your Profile
          </Text>
          <View className="gap-2">
            <ProfileRow label="Weight" value={user.weightKg ? `${user.weightKg} kg` : "---"} />
            <ProfileRow label="Height" value={user.heightCm ? `${user.heightCm} cm` : "---"} />
            <ProfileRow label="Age" value={user.age ? `${user.age}` : "---"} />
            <ProfileRow label="Sex" value={user.sex ?? "---"} />
            <ProfileRow
              label="Genotype"
              value={`${user.genotype} --- ${GENOTYPE_LABELS[user.genotype]}`}
            />
            <ProfileRow label="Smoker" value={user.smoking ? "Yes" : "No"} />
            <ProfileRow label="Half-life" value={`${pk.halfLife.toFixed(1)} hours`} />
          </View>
          <Button
            label="Edit Profile"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/onboarding/profile-setup")}
          />
        </Card>

        {/* Dosing targets */}
        <Card className="mb-3 gap-3">
          <Text className="text-text-secondary font-dm-sans text-sm">
            Dosing Targets
          </Text>

          <SliderRow
            label="Target Level"
            value={user.targetLevelMgL}
            min={1.5}
            max={6.0}
            unit="mg/L"
            onChange={(v) => handleTargetChange("targetLevelMgL", v)}
          />

          <SliderRow
            label="Bedtime Threshold"
            value={user.bedtimeThresholdMgL}
            min={0.3}
            max={2.0}
            unit="mg/L"
            onChange={(v) => handleTargetChange("bedtimeThresholdMgL", v)}
          />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-text-muted font-inter text-xs">Wake</Text>
              <Text className="text-text-primary font-inter-medium text-sm">
                {user.wakeTime}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-text-muted font-inter text-xs">Bed</Text>
              <Text className="text-text-primary font-inter-medium text-sm">
                {user.bedTime}
              </Text>
            </View>
          </View>
        </Card>

        {/* Device */}
        <Card className="mb-3 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-secondary font-dm-sans text-sm">
              Device
            </Text>
            <Badge
              label={ble.connectionState === "connected" ? "Connected" : "Offline"}
              variant={ble.connectionState === "connected" ? "success" : "muted"}
            />
          </View>

          {ble.bondedDeviceId ? (
            <View className="gap-2">
              <ProfileRow label="Name" value={ble.deviceName ?? "Caffio Device"} />
              <ProfileRow label="Cartridge" value={`${ble.cartridgePercent}%`} />
              {ble.firmwareVersion && (
                <ProfileRow label="Firmware" value={ble.firmwareVersion} />
              )}
              <Button
                label="Unpair Device"
                variant="ghost"
                size="sm"
                onPress={ble.clearBondedDevice}
              />
            </View>
          ) : (
            <Button
              label="Pair a Device"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/device/setup")}
            />
          )}
        </Card>

        {/* Preferences */}
        <Card className="mb-3 gap-3">
          <Text className="text-text-secondary font-dm-sans text-sm">
            Preferences
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-inter text-sm">
              Dosing Mode
            </Text>
            <Badge
              label={session.dosingMode === "on-demand" ? "On-Demand" : "Scheduled"}
              variant="info"
            />
          </View>
          {user.medications.length > 0 && (
            <View>
              <Text className="text-text-muted font-inter text-xs mb-1">
                Medications
              </Text>
              <View className="flex-row flex-wrap gap-1">
                {user.medications.map((med) => (
                  <Badge key={med} label={med} variant="warning" />
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Legal */}
        <Card className="gap-2">
          <Text className="text-text-secondary font-dm-sans text-sm">
            About
          </Text>
          <Text className="text-text-muted font-inter text-xs leading-4">
            Caffio is a wellness tool, not a medical device. Not intended to
            diagnose, treat, cure, or prevent any disease. Consult your
            healthcare provider before changing your caffeine habits.
          </Text>
          <Text className="text-text-muted font-inter text-xs">
            Version 1.0.0
          </Text>
        </Card>

        {/* Debug: Reset onboarding */}
        <View className="mt-6 mb-2">
          <Button
            label="Reset Onboarding"
            variant="ghost"
            size="sm"
            fullWidth
            onPress={handleResetOnboarding}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-text-muted font-inter text-sm">{label}</Text>
      <Text className="text-text-primary font-inter-medium text-sm">{value}</Text>
    </View>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const steps = 10;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-text-muted font-inter text-xs">{label}</Text>
        <Text className="text-text-primary font-inter-medium text-sm">
          {value.toFixed(1)} {unit}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-text-muted font-inter text-xs w-6">{min}</Text>
        <View className="flex-1 h-8 justify-center">
          <View className="h-1 w-full rounded-full bg-surface-elevated">
            <View
              className="h-full rounded-full bg-accent-primary"
              style={{ width: `${pct}%` }}
            />
          </View>
          <View className="absolute flex-row w-full h-full">
            {Array.from({ length: steps + 1 }, (_, i) => {
              const stepVal = min + (i / steps) * (max - min);
              return (
                <Pressable
                  key={i}
                  className="flex-1"
                  onPress={() => onChange(Math.round(stepVal * 10) / 10)}
                />
              );
            })}
          </View>
        </View>
        <Text className="text-text-muted font-inter text-xs w-6 text-right">{max}</Text>
      </View>
    </View>
  );
}
