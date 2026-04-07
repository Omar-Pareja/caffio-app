import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/lib/store/useUserStore";
import { useSessionStore } from "@/lib/store/useSessionStore";

const CONDITIONS = [
  { id: "pregnancy", label: "Pregnancy", severity: "absolute" },
  { id: "liver_disease", label: "Liver disease", severity: "absolute" },
  { id: "cardiac", label: "Cardiac condition", severity: "warning" },
  { id: "seizure", label: "Seizure disorder", severity: "absolute" },
] as const;

const MEDICATION_SUGGESTIONS = [
  "fluvoxamine",
  "ciprofloxacin",
  "oral contraceptives",
];

/** Medications that are absolute contraindications */
const BLOCKED_MEDICATIONS = ["fluvoxamine"];

export default function HealthScreeningScreen() {
  const setProfile = useUserStore((s) => s.setProfile);
  const setStep = useSessionStore((s) => s.setOnboardingStep);

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [medicationText, setMedicationText] = useState("");
  const [medications, setMedications] = useState<string[]>([]);

  const hasAbsoluteBlock =
    selectedConditions.some(
      (c) => CONDITIONS.find((cond) => cond.id === c)?.severity === "absolute",
    ) ||
    medications.some((m) =>
      BLOCKED_MEDICATIONS.includes(m.toLowerCase()),
    );

  const hasWarning =
    !hasAbsoluteBlock &&
    selectedConditions.some(
      (c) => CONDITIONS.find((cond) => cond.id === c)?.severity === "warning",
    );

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const addMedication = (med: string) => {
    const trimmed = med.trim().toLowerCase();
    if (trimmed && !medications.includes(trimmed)) {
      setMedications((prev) => [...prev, trimmed]);
    }
    setMedicationText("");
  };

  const removeMedication = (med: string) => {
    setMedications((prev) => prev.filter((m) => m !== med));
  };

  const handleNext = () => {
    setProfile({
      conditions: selectedConditions,
      medications,
    });
    setStep("preferences");
    router.push("/onboarding/preferences");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-text-primary font-dm-sans-semibold text-2xl mt-6 mb-2">
          Health Screening
        </Text>
        <Text className="text-text-secondary font-inter text-sm mb-6">
          Help us ensure safe dosing for your profile.
        </Text>

        {/* Conditions checklist */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-3">
          Medical Conditions
        </Text>
        <View className="gap-2 mb-6">
          {CONDITIONS.map((cond) => {
            const selected = selectedConditions.includes(cond.id);
            return (
              <Pressable
                key={cond.id}
                onPress={() => toggleCondition(cond.id)}
                className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                  selected
                    ? "bg-accent-danger/10 border-accent-danger"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`font-inter text-sm ${
                    selected ? "text-accent-danger" : "text-text-primary"
                  }`}
                >
                  {cond.label}
                </Text>
                <View
                  className={`h-5 w-5 rounded-md border items-center justify-center ${
                    selected ? "bg-accent-danger border-accent-danger" : "border-border"
                  }`}
                >
                  {selected && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Medications */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-3">
          Current Medications
        </Text>
        <View className="flex-row items-center rounded-xl bg-surface border border-border px-4 py-3 mb-3">
          <TextInput
            className="flex-1 text-text-primary font-inter text-sm"
            value={medicationText}
            onChangeText={setMedicationText}
            placeholder="Type a medication name..."
            placeholderTextColor="#636366"
            onSubmitEditing={() => addMedication(medicationText)}
            returnKeyType="done"
          />
        </View>

        {/* Suggestions */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {MEDICATION_SUGGESTIONS.filter((m) => !medications.includes(m)).map(
            (med) => (
              <Pressable
                key={med}
                onPress={() => addMedication(med)}
                className="rounded-full border border-border px-3 py-1"
              >
                <Text className="text-text-secondary font-inter text-xs">
                  + {med}
                </Text>
              </Pressable>
            ),
          )}
        </View>

        {/* Added medications */}
        {medications.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {medications.map((med) => (
              <Pressable
                key={med}
                onPress={() => removeMedication(med)}
                className="flex-row items-center rounded-full bg-surface-elevated px-3 py-1"
              >
                <Text className="text-text-primary font-inter text-xs mr-1">
                  {med}
                </Text>
                <Text className="text-text-muted text-xs">×</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Absolute block */}
        {hasAbsoluteBlock && (
          <Card className="mb-6 border-accent-danger">
            <View className="flex-row items-start gap-3">
              <Text className="text-accent-danger text-lg">⚠</Text>
              <View className="flex-1">
                <Text className="text-accent-danger font-dm-sans-semibold text-base mb-1">
                  Cannot Provide Dosing
                </Text>
                <Text className="text-text-secondary font-inter text-sm leading-5">
                  Based on your profile, Caffio cannot safely provide caffeine
                  dosing recommendations. Please consult your healthcare provider.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Warning */}
        {hasWarning && (
          <Card className="mb-6 border-accent-warning">
            <View className="flex-row items-start gap-3">
              <Badge label="Adjusted" variant="warning" />
              <Text className="flex-1 text-text-secondary font-inter text-sm leading-5">
                Your daily limits will be reduced for safety. Dosing is still
                available within adjusted parameters.
              </Text>
            </View>
          </Card>
        )}

        <Button
          label={hasAbsoluteBlock ? "I Understand" : "Continue"}
          variant={hasAbsoluteBlock ? "secondary" : "primary"}
          size="lg"
          fullWidth
          onPress={hasAbsoluteBlock ? () => router.back() : handleNext}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
