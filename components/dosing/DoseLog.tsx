import { View, Text, Pressable } from "react-native";
import { Card } from "@/components/ui/Card";
import type { DoseRecord } from "@/lib/store/useDoseStore";

interface DoseLogProps {
  doses: DoseRecord[];
  expanded: boolean;
  onToggle: () => void;
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export function DoseLog({ doses, expanded, onToggle }: DoseLogProps) {
  if (doses.length === 0) return null;

  const shown = expanded ? doses : doses.slice(-3);

  return (
    <Card className="gap-2">
      <Pressable onPress={onToggle} className="flex-row items-center justify-between">
        <Text className="text-text-secondary font-dm-sans text-sm">
          Today's Doses
        </Text>
        <Text className="text-text-muted font-inter text-xs">
          {expanded ? "Show less" : `${doses.length} total`}
        </Text>
      </Pressable>

      {shown.map((dose, i) => (
        <View
          key={dose.doseId}
          className={`flex-row items-center justify-between py-2 ${
            i < shown.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`h-2 w-2 rounded-full ${
                dose.confirmed ? "bg-accent-danger" : "bg-accent-warning"
              }`}
            />
            <Text className="text-text-primary font-inter text-sm">
              {formatTime(dose.timestamp)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-text-primary font-inter-medium text-sm">
              {dose.amountMg} mg
            </Text>
            <Text className="text-text-muted font-inter text-xs">
              {dose.source === "device" ? "dispensed" : "manual"}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}
