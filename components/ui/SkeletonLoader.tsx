import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonLoaderProps {
  width: number;
  height: number;
  borderRadius?: number;
}

export function SkeletonLoader({
  width,
  height,
  borderRadius = 8,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ width, height, borderRadius, overflow: "hidden" }}>
      <Animated.View
        className="bg-surface-elevated flex-1"
        style={[{ borderRadius }, animatedStyle]}
      />
    </View>
  );
}
