import { View, Text } from "react-native";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: "bg-accent-success/15", text: "text-accent-success" },
  warning: { bg: "bg-accent-warning/15", text: "text-accent-warning" },
  danger: { bg: "bg-accent-danger/15", text: "text-accent-danger" },
  info: { bg: "bg-accent-primary/15", text: "text-accent-primary" },
  muted: { bg: "bg-surface-elevated", text: "text-text-muted" },
};

export function Badge({ label, variant = "info" }: BadgeProps) {
  const v = variantStyles[variant];

  return (
    <View className={`self-start rounded-full px-3 py-1 ${v.bg}`}>
      <Text className={`text-xs font-inter-medium ${v.text}`}>
        {label}
      </Text>
    </View>
  );
}
