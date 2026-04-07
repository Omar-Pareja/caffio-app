import { View, Text } from "react-native";
import { Badge } from "./Badge";

type Trend = "rising" | "falling" | "stable";
type Status = "inZone" | "buildingUp" | "windingDown" | "complete";

interface MetricDisplayProps {
  value: string;
  unit: string;
  trend: Trend;
  status: Status;
}

const trendArrows: Record<Trend, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

const trendColors: Record<Trend, string> = {
  rising: "text-accent-warning",
  falling: "text-accent-primary",
  stable: "text-accent-success",
};

const statusConfig: Record<Status, { label: string; variant: "success" | "warning" | "info" | "muted" }> = {
  inZone: { label: "In the Zone", variant: "success" },
  buildingUp: { label: "Building Up", variant: "warning" },
  windingDown: { label: "Winding Down", variant: "info" },
  complete: { label: "Dosing Complete", variant: "muted" },
};

export function MetricDisplay({ value, unit, trend, status }: MetricDisplayProps) {
  const arrow = trendArrows[trend];
  const arrowColor = trendColors[trend];
  const statusInfo = statusConfig[status];

  return (
    <View className="items-center gap-2">
      <View className="flex-row items-baseline gap-1">
        <Text className="text-text-primary font-bricolage text-5xl tracking-tight">
          {value}
        </Text>
        <Text className="text-text-secondary font-inter text-base">
          {unit}
        </Text>
        <Text className={`text-2xl ${arrowColor} ml-1`}>
          {arrow}
        </Text>
      </View>
      <Badge label={statusInfo.label} variant={statusInfo.variant} />
    </View>
  );
}
