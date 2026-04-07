import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUserStore } from "@/lib/store/useUserStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import type { Genotype } from "@/lib/api/types";

const GENOTYPE_OPTIONS: { value: Genotype; label: string; desc: string }[] = [
  { value: "AA", label: "AA", desc: "Fast metabolizer" },
  { value: "AC", label: "AC", desc: "Normal metabolizer" },
  { value: "CC", label: "CC", desc: "Slow metabolizer" },
  { value: "unknown", label: "I don't know", desc: "We'll use a safe default" },
];

const WAKE_TIMES = ["05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00"];
const BED_TIMES = ["21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"];

export default function PreferencesScreen() {
  const store = useUserStore();
  const setProfile = store.setProfile;
  const setStep = useSessionStore((s) => s.setOnboardingStep);

  const [wakeTime, setWakeTime] = useState(store.wakeTime);
  const [bedTime, setBedTime] = useState(store.bedTime);
  const [genotype, setGenotype] = useState<Genotype>(store.genotype);
  const [smoking, setSmoking] = useState(store.smoking);
  const [caffeineEstimate, setCaffeineEstimate] = useState(store.dailyCaffeineEstimateMg);
  const [showGenInfo, setShowGenInfo] = useState(false);

  const handleNext = () => {
    setProfile({
      wakeTime,
      bedTime,
      genotype,
      smoking,
      dailyCaffeineEstimateMg: caffeineEstimate,
    });
    setStep("device");
    router.push("/onboarding/device-setup");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-text-primary font-dm-sans-semibold text-2xl mt-6 mb-2">
          Preferences
        </Text>
        <Text className="text-text-secondary font-inter text-sm mb-6">
          Customize your dosing schedule and metabolism profile.
        </Text>

        {/* Wake time */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-2">
          Wake Time
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerClassName="gap-2"
        >
          {WAKE_TIMES.map((t) => (
            <TimeChip key={t} time={t} selected={wakeTime === t} onPress={() => setWakeTime(t)} />
          ))}
        </ScrollView>

        {/* Bed time */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-2">
          Bed Time
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerClassName="gap-2"
        >
          {BED_TIMES.map((t) => (
            <TimeChip key={t} time={t} selected={bedTime === t} onPress={() => setBedTime(t)} />
          ))}
        </ScrollView>

        {/* Genotype */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider">
            CYP1A2 Genotype
          </Text>
          <Pressable onPress={() => setShowGenInfo(!showGenInfo)}>
            <Text className="text-accent-primary font-inter text-xs">
              What is this?
            </Text>
          </Pressable>
        </View>

        {showGenInfo && (
          <Card className="mb-3">
            <Text className="text-text-secondary font-inter text-sm leading-5">
              CYP1A2 is the liver enzyme that metabolizes caffeine. Your genotype
              determines how fast you process it. AA = fast, CC = slow. You can
              find this in 23andMe or similar genetic tests.
            </Text>
          </Card>
        )}

        <View className="gap-2 mb-5">
          {GENOTYPE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setGenotype(opt.value)}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                genotype === opt.value
                  ? "bg-accent-primary/10 border-accent-primary"
                  : "bg-surface border-border"
              }`}
            >
              <View>
                <Text
                  className={`font-inter-medium text-sm ${
                    genotype === opt.value ? "text-accent-primary" : "text-text-primary"
                  }`}
                >
                  {opt.label}
                </Text>
                <Text className="text-text-muted font-inter text-xs">{opt.desc}</Text>
              </View>
              <View
                className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                  genotype === opt.value ? "border-accent-primary" : "border-border"
                }`}
              >
                {genotype === opt.value && (
                  <View className="h-2.5 w-2.5 rounded-full bg-accent-primary" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Smoking toggle */}
        <Pressable
          onPress={() => setSmoking(!smoking)}
          className="flex-row items-center justify-between rounded-xl bg-surface border border-border px-4 py-3 mb-5"
        >
          <View>
            <Text className="text-text-primary font-inter-medium text-sm">
              Smoker
            </Text>
            <Text className="text-text-muted font-inter text-xs">
              Smoking increases caffeine metabolism by ~35%
            </Text>
          </View>
          <View
            className={`h-7 w-12 rounded-full p-0.5 ${
              smoking ? "bg-accent-primary" : "bg-surface-elevated"
            }`}
          >
            <View
              className={`h-6 w-6 rounded-full bg-white ${
                smoking ? "self-end" : "self-start"
              }`}
            />
          </View>
        </Pressable>

        {/* Daily caffeine estimate */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-2">
          Current Daily Caffeine ({caffeineEstimate} mg)
        </Text>
        <View className="flex-row items-center gap-3 mb-6">
          <Text className="text-text-muted font-inter text-xs">0</Text>
          <View className="flex-1 h-8 justify-center">
            <View className="h-1 w-full rounded-full bg-surface-elevated">
              <View
                className="h-full rounded-full bg-accent-primary"
                style={{ width: `${(caffeineEstimate / 600) * 100}%` }}
              />
            </View>
            {/* Tap zones for slider simulation */}
            <View className="absolute flex-row w-full h-full">
              {[0, 100, 200, 300, 400, 500, 600].map((v) => (
                <Pressable
                  key={v}
                  className="flex-1"
                  onPress={() => setCaffeineEstimate(v)}
                />
              ))}
            </View>
          </View>
          <Text className="text-text-muted font-inter text-xs">600</Text>
        </View>

        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeChip({
  time,
  selected,
  onPress,
}: {
  time: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-lg border px-4 py-2 ${
        selected
          ? "bg-accent-primary/15 border-accent-primary"
          : "bg-surface border-border"
      }`}
    >
      <Text
        className={`font-inter-medium text-sm ${
          selected ? "text-accent-primary" : "text-text-secondary"
        }`}
      >
        {time}
      </Text>
    </Pressable>
  );
}
