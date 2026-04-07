import { useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CaffeineChart } from "@/components/charts/CaffeineChart";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useScheduleGenerate } from "@/lib/api/useSchedule";
import { derivePKParameters, DEFAULT_PK } from "@/lib/pk/parameters";
import { generateCurve } from "@/lib/pk/curve";
import type { DoseEvent } from "@/lib/pk/bateman";
import type { ScheduledDose } from "@/lib/api/types";

type DisplayStatus = "taken" | "upcoming" | "skipped";

interface DisplayDose {
  id: string;
  time: string;
  hour: number;
  amountMg: number;
  status: DisplayStatus;
}

const statusBadge: Record<DisplayStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  taken: { label: "Taken", variant: "success" },
  upcoming: { label: "Upcoming", variant: "warning" },
  skipped: { label: "Skipped", variant: "muted" },
};

function currentFractionalHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/** Convert server dose time (ISO string) to a display dose */
function toDisplayDose(dose: ScheduledDose, index: number, nowHr: number): DisplayDose {
  const date = new Date(dose.time);
  const hour = date.getHours() + date.getMinutes() / 60;
  const timeLabel = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return {
    id: `s-${index}`,
    time: timeLabel,
    hour,
    amountMg: dose.amount_mg,
    status: hour < nowHr ? "taken" : "upcoming",
  };
}

export default function ScheduleScreen() {
  const { dosingMode, setDosingMode } = useSessionStore();
  const user = useUserStore();
  const scheduleGen = useScheduleGenerate();

  const pk = useMemo(() => {
    if (user.weightKg && user.genotype) {
      return derivePKParameters({
        weightKg: user.weightKg,
        genotype: user.genotype,
        smoking: user.smoking,
      });
    }
    return DEFAULT_PK;
  }, [user.weightKg, user.genotype, user.smoking]);

  const nowHr = currentFractionalHour();

  // Fetch schedule from server when in scheduled mode
  const fetchSchedule = useCallback(() => {
    if (user.userId && dosingMode === "scheduled") {
      scheduleGen.mutate({
        user_id: user.userId,
        target_mg_l: user.targetLevelMgL,
      });
    }
  }, [user.userId, user.targetLevelMgL, dosingMode, scheduleGen]);

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dosingMode, user.userId]);

  // Convert server schedule to display format
  const schedule: DisplayDose[] = useMemo(() => {
    if (scheduleGen.data?.doses) {
      return scheduleGen.data.doses.map((d, i) => toDisplayDose(d, i, nowHr));
    }
    return [];
  }, [scheduleGen.data, nowHr]);

  // Generate projected curve from the schedule
  const doseEvents: DoseEvent[] = useMemo(
    () => schedule.map((s) => ({ timeHr: s.hour, amountMg: s.amountMg })),
    [schedule],
  );

  const curveData = useMemo(
    () => generateCurve(doseEvents, pk),
    [doseEvents, pk],
  );

  const doseMarkers = useMemo(
    () =>
      doseEvents.map((de) => {
        const point = curveData.find((p) => Math.abs(p.hour - de.timeHr) < 0.15);
        return { hour: de.timeHr, mg: de.amountMg, level: point?.level ?? 0 };
      }),
    [doseEvents, curveData],
  );

  const totalMg = scheduleGen.data?.daily_total_mg
    ?? schedule.reduce((sum, s) => sum + s.amountMg, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-text-primary font-dm-sans-semibold text-xl py-3">
          Schedule
        </Text>

        {/* Mode toggle */}
        <View className="flex-row rounded-xl bg-surface border border-border p-1 mb-4">
          <ModeTab
            label="On-Demand"
            active={dosingMode === "on-demand"}
            onPress={() => setDosingMode("on-demand")}
          />
          <ModeTab
            label="Scheduled"
            active={dosingMode === "scheduled"}
            onPress={() => setDosingMode("scheduled")}
          />
        </View>

        {dosingMode === "on-demand" ? (
          <Card className="items-center py-8">
            <Text className="text-text-primary font-dm-sans-semibold text-base mb-2">
              On-Demand Mode
            </Text>
            <Text className="text-text-secondary font-inter text-sm text-center leading-5 px-4">
              Press the DOSE ME button on the Home tab whenever you want
              caffeine. The system calculates the optimal amount in real time.
            </Text>
          </Card>
        ) : scheduleGen.isPending ? (
          <View className="gap-3">
            <SkeletonLoader height={200} borderRadius={16} />
            <SkeletonLoader height={60} borderRadius={16} />
            <SkeletonLoader height={60} borderRadius={16} />
            <SkeletonLoader height={60} borderRadius={16} />
          </View>
        ) : scheduleGen.isError ? (
          <Card className="items-center py-8">
            <Text className="text-text-primary font-dm-sans-semibold text-base mb-2">
              Could not generate schedule
            </Text>
            <Text className="text-text-secondary font-inter text-sm text-center leading-5 px-4 mb-4">
              {user.userId
                ? "The server is not reachable. Check your connection and try again."
                : "Complete onboarding to enable scheduled dosing."}
            </Text>
            {user.userId && (
              <Pressable
                onPress={fetchSchedule}
                className="rounded-xl bg-accent-primary px-6 py-2"
              >
                <Text className="text-white font-inter-medium text-sm">Retry</Text>
              </Pressable>
            )}
          </Card>
        ) : (
          <>
            {/* Projected curve */}
            <Card className="mb-3 px-2 py-3">
              <Text className="text-text-secondary font-dm-sans text-sm mb-2 px-2">
                Projected Curve
              </Text>
              <CaffeineChart
                curveData={curveData}
                doseMarkers={doseMarkers}
                currentHour={nowHr}
                targetLow={user.targetLevelMgL - 0.5}
                targetHigh={user.targetLevelMgL + 0.5}
                bedtimeThreshold={user.bedtimeThresholdMgL}
              />
            </Card>

            {/* Schedule summary */}
            <View className="flex-row justify-between mb-3 px-1">
              <Text className="text-text-muted font-inter text-xs">
                {schedule.length} doses planned
              </Text>
              <Text className="text-text-muted font-inter text-xs">
                {totalMg} mg total
              </Text>
            </View>

            {/* Dose list */}
            {schedule.length === 0 ? (
              <Card className="items-center py-6">
                <Text className="text-text-secondary font-inter text-sm">
                  No doses scheduled for today.
                </Text>
              </Card>
            ) : (
              <View className="gap-2">
                {schedule.map((dose) => {
                  const badge = statusBadge[dose.status];
                  const isPast = dose.status === "taken" || dose.status === "skipped";
                  return (
                    <Card
                      key={dose.id}
                      className={isPast ? "opacity-60" : ""}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <View
                            className={`h-2 w-2 rounded-full ${
                              dose.status === "taken"
                                ? "bg-accent-success"
                                : dose.status === "upcoming"
                                  ? "bg-accent-warning"
                                  : "bg-text-muted"
                            }`}
                          />
                          <View>
                            <Text className="text-text-primary font-inter-medium text-sm">
                              {dose.time}
                            </Text>
                            <Text className="text-text-muted font-inter text-xs">
                              {dose.amountMg} mg
                            </Text>
                          </View>
                        </View>
                        <Badge label={badge.label} variant={badge.variant} />
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-lg py-2 ${
        active ? "bg-surface-elevated" : ""
      }`}
    >
      <Text
        className={`font-inter-medium text-sm ${
          active ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
