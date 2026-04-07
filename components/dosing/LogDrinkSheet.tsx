/**
 * Bottom sheet for logging external caffeine drinks.
 * Shows common drink presets and a custom amount option.
 */

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import type { DrinkFormulation } from "@/lib/store/useDoseStore";

interface DrinkPreset {
  name: string;
  amountMg: number;
  formulation: Exclude<DrinkFormulation, "caffio">;
}

const PRESETS: DrinkPreset[] = [
  { name: "Espresso", amountMg: 63, formulation: "coffee" },
  { name: "Coffee 8oz", amountMg: 95, formulation: "coffee" },
  { name: "Coffee 12oz", amountMg: 140, formulation: "coffee" },
  { name: "Coffee 16oz", amountMg: 190, formulation: "coffee" },
  { name: "Tea", amountMg: 47, formulation: "tea" },
  { name: "Energy Drink", amountMg: 80, formulation: "energy_drink" },
  { name: "Energy Drink Large", amountMg: 160, formulation: "energy_drink" },
  { name: "Celsius", amountMg: 200, formulation: "energy_drink" },
];

interface LogDrinkSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (amountMg: number, formulation: Exclude<DrinkFormulation, "caffio">) => void;
}

export function LogDrinkSheet({ visible, onClose, onSelect }: LogDrinkSheetProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const handlePreset = (preset: DrinkPreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(preset.amountMg, preset.formulation);
    handleClose();
  };

  const handleCustomSubmit = () => {
    const mg = parseInt(customAmount, 10);
    if (mg > 0 && mg <= 1000) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(mg, "coffee");
      handleClose();
    }
  };

  const handleClose = () => {
    setShowCustom(false);
    setCustomAmount("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            className="bg-surface rounded-t-3xl px-4 pb-8 pt-3"
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View className="mb-4 items-center">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            {/* Title */}
            <Text className="text-text-primary font-dm-sans-semibold text-lg mb-4 px-1">
              Log a Drink
            </Text>

            {showCustom ? (
              <CustomAmountInput
                value={customAmount}
                onChange={setCustomAmount}
                onSubmit={handleCustomSubmit}
                onBack={() => setShowCustom(false)}
              />
            ) : (
              <>
                {/* Preset grid */}
                {PRESETS.map((preset) => (
                  <Pressable
                    key={preset.name}
                    className="flex-row items-center justify-between border-b border-border py-3.5 px-1 active:opacity-70"
                    onPress={() => handlePreset(preset)}
                  >
                    <Text className="text-text-primary font-inter text-sm">
                      {preset.name}
                    </Text>
                    <Text className="text-text-secondary font-inter-medium text-sm">
                      {preset.amountMg} mg
                    </Text>
                  </Pressable>
                ))}

                {/* Custom option */}
                <Pressable
                  className="flex-row items-center justify-between py-3.5 px-1 active:opacity-70"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCustom(true);
                  }}
                >
                  <Text className="text-accent-primary font-inter-medium text-sm">
                    Custom amount
                  </Text>
                  <Text className="text-text-muted font-inter text-xs">
                    Enter mg
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function CustomAmountInput({
  value,
  onChange,
  onSubmit,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const isValid = parseInt(value, 10) > 0 && parseInt(value, 10) <= 1000;

  return (
    <View className="gap-4">
      <Pressable onPress={onBack} className="active:opacity-70">
        <Text className="text-accent-primary font-inter-medium text-sm">
          ← Back to presets
        </Text>
      </Pressable>

      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text-primary font-inter text-base"
          placeholder="Caffeine amount"
          placeholderTextColor="#636366"
          keyboardType="number-pad"
          value={value}
          onChangeText={onChange}
          autoFocus
          maxLength={4}
        />
        <Text className="text-text-secondary font-inter text-sm">mg</Text>
      </View>

      <Pressable
        className={`items-center rounded-xl py-3 ${isValid ? "bg-accent-primary active:opacity-80" : "bg-surface-elevated opacity-40"}`}
        onPress={onSubmit}
        disabled={!isValid}
      >
        <Text className={`font-dm-sans-semibold text-sm ${isValid ? "text-background" : "text-text-muted"}`}>
          Log Drink
        </Text>
      </Pressable>
    </View>
  );
}
