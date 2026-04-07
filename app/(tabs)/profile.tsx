import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/lib/store/useUserStore";
import { useBleStore } from "@/lib/store/useBleStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { derivePKParameters, DEFAULT_PK } from "@/lib/pk/parameters";

const GENOTYPE_LABELS: Record<string, string> = {
  AA: "Fast metabolizer",
  AC: "Normal metabolizer",
  CC: "Slow metabolizer",
  unknown: "Unknown",
};

export default function ProfileScreen() {
  const user = useUserStore();
  const ble = useBleStore();
  const session = useSessionStore();

  const pk = user.weightKg
    ? derivePKParameters({
        weightKg: user.weightKg,
        genotype: user.genotype,
        smoking: user.smoking,
      })
    : DEFAULT_PK;

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

        {/* Profile summary */}
        <Card className="mb-3 gap-3">
          <Text className="text-text-secondary font-dm-sans text-sm">
            Your Profile
          </Text>
          <View className="gap-2">
            <ProfileRow label="Weight" value={user.weightKg ? `${user.weightKg} kg` : "—"} />
            <ProfileRow label="Height" value={user.heightCm ? `${user.heightCm} cm` : "—"} />
            <ProfileRow label="Age" value={user.age ? `${user.age}` : "—"} />
            <ProfileRow label="Sex" value={user.sex ?? "—"} />
            <ProfileRow
              label="Genotype"
              value={`${user.genotype} — ${GENOTYPE_LABELS[user.genotype]}`}
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
            onChange={(v) => user.setProfile({ targetLevelMgL: v })}
          />

          <SliderRow
            label="Bedtime Threshold"
            value={user.bedtimeThresholdMgL}
            min={0.3}
            max={2.0}
            unit="mg/L"
            onChange={(v) => user.setProfile({ bedtimeThresholdMgL: v })}
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
