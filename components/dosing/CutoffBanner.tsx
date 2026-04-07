import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { TIMING } from "@/constants/config";

interface CutoffBannerProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
}

export function CutoffBanner({ message, visible, onDismiss }: CutoffBannerProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const [render, setRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRender(true);
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });

      // Auto-dismiss
      if (onDismiss) {
        opacity.value = withDelay(
          TIMING.TOAST_DISMISS_MS,
          withTiming(0, { duration: 200 }, () => {
            runOnJS(onDismiss)();
          }),
        );
        translateY.value = withDelay(
          TIMING.TOAST_DISMISS_MS,
          withTiming(-20, { duration: 200 }),
        );
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-20, { duration: 200 });
      setTimeout(() => setRender(false), 250);
    }
  }, [visible, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!render) return null;

  return (
    <Animated.View
      className="rounded-xl bg-accent-warning/15 border border-accent-warning/30 px-4 py-3 mb-2"
      style={animatedStyle}
    >
      <Text className="text-accent-warning font-inter-medium text-sm text-center">
        {message}
      </Text>
    </Animated.View>
  );
}
