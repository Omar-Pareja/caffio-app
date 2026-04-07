import { Pressable, Text, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-accent-primary",
    text: "text-background",
  },
  secondary: {
    container: "bg-surface-elevated border border-border",
    text: "text-text-primary",
  },
  danger: {
    container: "bg-accent-danger",
    text: "text-white",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-accent-primary",
  },
};

const sizeClasses: Record<string, { container: string; text: string }> = {
  sm: { container: "py-2 px-4 rounded-lg", text: "text-xs" },
  md: { container: "py-3 px-5 rounded-xl", text: "text-sm" },
  lg: { container: "py-4 px-6 rounded-xl", text: "text-base" },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  onPress,
  disabled,
  ...rest
}: ButtonProps) {
  const v = variantClasses[variant];
  const s = sizeClasses[size];

  const handlePress = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`items-center justify-center ${s.container} ${v.container} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-40" : "active:opacity-80"}`}
      {...rest}
    >
      <Text className={`font-dm-sans-semibold ${s.text} ${v.text}`}>
        {label}
      </Text>
    </Pressable>
  );
}
