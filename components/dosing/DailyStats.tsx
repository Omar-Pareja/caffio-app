import { View, Text, Pressable } from "react-native";
import { Card } from "@/components/ui/Card";

interface DailyStatsProps {
  dailyTotal: number;
  dailyLimit: number;
  doseCount: number;
  cutoffTime: string;
  onPress?: () => void;
}

export function DailyStats({
  dailyTotal,
  dailyLimit,
  doseCount,
  cutoffTime,
  onPress,
}: DailyStatsProps) {
  const progress = Math.min(dailyTotal / dailyLimit, 1);
  const remaining = Math.max(dailyLimit - dailyTotal, 0);

  return (
    <Pressable onPress={onPress}>
      <Card className="gap-3">
        {/* Progress bar */}
        <View className="h-1.5 w-full rounded-full bg-surface-elevated">
          <View
            className="h-full rounded-full bg-accent-primary"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {/* Stats row */}
        <View className="flex-row justify-between">
          <StatItem
            label="Daily Total"
            value={`${dailyTotal} / ${dailyLimit} mg`}
          />
          <StatItem label="Doses" value={`${doseCount} today`} />
          <StatItem label="Cutoff" value={cutoffTime} />
        </View>

        {/* Remaining */}
        <Text className="text-text-muted font-inter text-xs text-center">
          {remaining > 0
            ? `${remaining} mg remaining`
            : "Daily limit reached"}
        </Text>
      </Card>
    </Pressable>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center gap-0.5">
      <Text className="text-text-muted font-inter text-xs">{label}</Text>
      <Text className="text-text-primary font-inter-medium text-sm">
        {value}
      </Text>
    </View>
  );
}
