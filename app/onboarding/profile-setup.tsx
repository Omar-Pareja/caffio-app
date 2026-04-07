import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUserStore } from "@/lib/store/useUserStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import type { Sex } from "@/lib/api/types";

export default function ProfileSetupScreen() {
  const setProfile = useUserStore((s) => s.setProfile);
  const setStep = useSessionStore((s) => s.setOnboardingStep);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [showWhy, setShowWhy] = useState(false);

  const isValid = weight && height && age && sex;

  const handleNext = () => {
    if (!isValid) return;
    setProfile({
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      age: parseInt(age, 10),
      sex,
    });
    setStep("health");
    router.push("/onboarding/health-screening");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-text-primary font-dm-sans-semibold text-2xl mt-6 mb-2">
          Your Profile
        </Text>
        <Text className="text-text-secondary font-inter text-sm mb-6">
          Used to calculate your personal caffeine metabolism.
        </Text>

        {/* Weight */}
        <InputField
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          placeholder="70"
          suffix="kg"
          keyboardType="numeric"
        />

        {/* Height */}
        <InputField
          label="Height"
          value={height}
          onChangeText={setHeight}
          placeholder="175"
          suffix="cm"
          keyboardType="numeric"
        />

        {/* Age */}
        <InputField
          label="Age"
          value={age}
          onChangeText={setAge}
          placeholder="30"
          suffix="years"
          keyboardType="numeric"
        />

        {/* Sex selector */}
        <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-2 mt-4">
          Sex
        </Text>
        <View className="flex-row gap-3 mb-6">
          <SexOption label="Male" selected={sex === "male"} onPress={() => setSex("male")} />
          <SexOption label="Female" selected={sex === "female"} onPress={() => setSex("female")} />
        </View>

        {/* Why we need this */}
        <Pressable onPress={() => setShowWhy(!showWhy)}>
          <Text className="text-accent-primary font-inter text-sm mb-2">
            {showWhy ? "▾" : "▸"} Why we need this
          </Text>
        </Pressable>
        {showWhy && (
          <Card className="mb-6">
            <Text className="text-text-secondary font-inter text-sm leading-5">
              Your weight determines caffeine distribution volume. Sex and age
              affect metabolism speed. These values help us calculate your
              personal pharmacokinetic profile for accurate dosing.
            </Text>
          </Card>
        )}

        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onPress={handleNext}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  suffix: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary font-inter-medium text-xs uppercase tracking-wider mb-2">
        {label}
      </Text>
      <View className="flex-row items-center rounded-xl bg-surface border border-border px-4 py-3">
        <TextInput
          className="flex-1 text-text-primary font-inter text-base"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#636366"
          keyboardType={keyboardType}
        />
        <Text className="text-text-muted font-inter text-sm ml-2">{suffix}</Text>
      </View>
    </View>
  );
}

function SexOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-xl border py-3 ${
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
        {label}
      </Text>
    </Pressable>
  );
}
