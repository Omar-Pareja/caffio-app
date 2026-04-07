import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface DoseButtonProps {
  available: boolean;
  lastDoseAmount?: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DoseButton({ available, lastDoseAmount, onPress }: DoseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handlePress = () => {
    if (!available) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Button press animation
    scale.value = withSequence(
      withSpring(0.92, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );

    // Expanding ring animation
    ringScale.value = 1;
    ringOpacity.value = 0.6;
    ringScale.value = withTiming(1.8, { duration: 600 });
    ringOpacity.value = withTiming(0, { duration: 600 });

    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2500);

    onPress();
  };

  const bgColor = available ? "bg-accent-danger" : "bg-surface-elevated";
  const borderColor = available ? "border-accent-danger" : "border-border";

  return (
    <View className="items-center py-2">
      <View className="items-center justify-center" style={{ width: 130, height: 130 }}>
        {/* Expanding ring effect */}
        <Animated.View
          className={`absolute rounded-full ${available ? "bg-accent-danger" : "bg-transparent"}`}
          style={[{ width: 120, height: 120 }, animatedRingStyle]}
        />

        {/* Main button */}
        <AnimatedPressable
          onPress={handlePress}
          className={`h-28 w-28 items-center justify-center rounded-full border-2 ${bgColor} ${borderColor}`}
          style={animatedButtonStyle}
        >
          <Text
            className={`font-dm-sans-semibold text-lg ${available ? "text-white" : "text-text-muted"}`}
          >
            {available ? "DOSE ME" : "COMPLETE"}
          </Text>
        </AnimatedPressable>
      </View>

      {/* Confirmation toast */}
      {showConfirm && lastDoseAmount !== undefined && (
        <View className="mt-2 rounded-full bg-accent-success/15 px-4 py-1.5">
          <Text className="text-accent-success font-inter-medium text-sm">
            {lastDoseAmount} mg dispensed
          </Text>
        </View>
      )}
    </View>
  );
}
