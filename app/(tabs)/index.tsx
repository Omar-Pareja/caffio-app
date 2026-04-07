import { useCallback, useMemo } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Card } from "@/components/ui/Card";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { CaffeineChart } from "@/components/charts/CaffeineChart";
import { DoseButton } from "@/components/dosing/DoseButton";
import { DailyStats } from "@/components/dosing/DailyStats";
import { DoseLog } from "@/components/dosing/DoseLog";
import { CutoffBanner } from "@/components/dosing/CutoffBanner";
import { DeviceStatus } from "@/components/device/DeviceStatus";
import { useUserStore } from "@/lib/store/useUserStore";
import { useDoseStore } from "@/lib/store/useDoseStore";
import { useBleStore } from "@/lib/store/useBleStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useDoseRequest } from "@/lib/api/useDoseRequest";
import { useCurve } from "@/lib/api/useCurve";
import { derivePKParameters, DEFAULT_PK } from "@/lib/pk/parameters";
import { generateCurve, predictAtTime } from "@/lib/pk/curve";
import type { DoseEvent } from "@/lib/pk/bateman";
import type { CurvePoint as LocalCurvePoint } from "@/lib/pk/curve";

/** Convert store doses to PK DoseEvent format */
function toDoseEvents(doses: { timestamp: string; amountMg: number }[]): DoseEvent[] {
  return doses.map((d) => {
    const date = new Date(d.timestamp);
    return {
      timeHr: date.getHours() + date.getMinutes() / 60,
      amountMg: d.amountMg,
    };
  });
}

/** Derive the current caffeine status */
function deriveStatus(level: number, target: number): "inZone" | "buildingUp" | "windingDown" | "complete" {
  if (level < 0.5) return "complete";
  if (level < target - 0.5) return "buildingUp";
  if (level > target + 0.5) return "windingDown";
  return "inZone";
}

/** Derive trend from two curve points */
function deriveTrend(level: number, prevLevel: number): "rising" | "falling" | "stable" {
  const diff = level - prevLevel;
  if (diff > 0.05) return "rising";
  if (diff < -0.05) return "falling";
  return "stable";
}

function currentFractionalHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/**
 * Convert server curve points (ISO timestamps) to local chart format.
 * Server returns {time, point_estimate, lower_bound, upper_bound}.
 */
function serverCurveToLocal(
  points: { time: string; point_estimate: number; lower_bound: number; upper_bound: number }[],
): LocalCurvePoint[] {
  return points.map((p) => {
    const date = new Date(p.time);
    const hour = date.getHours() + date.getMinutes() / 60;
    return {
      hour: Math.round(hour * 100) / 100,
      level: p.point_estimate,
      upper: p.upper_bound,
      lower: p.lower_bound,
    };
  });
}

export default function HomeScreen() {
  // Stores
  const user = useUserStore();
  const doseStore = useDoseStore();
  const bleStore = useBleStore();
  const { doseLogExpanded, toggleDoseLog } = useSessionStore();

  // API hooks
  const doseRequest = useDoseRequest();
  const curveQuery = useCurve(user.userId);

  // Derive PK params from user profile (or use defaults)
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

  // Current time
  const nowHr = currentFractionalHour();

  // Convert stored doses to DoseEvents for the PK model
  const doseEvents = useMemo(
    () => toDoseEvents(doseStore.doses),
    [doseStore.doses],
  );

  // Generate local curve as fallback / instant UI
  const localCurveData = useMemo(
    () => generateCurve(doseEvents, pk),
    [doseEvents, pk],
  );

  // Use server curve when available, fall back to local PK model
  const curveData = useMemo(() => {
    if (curveQuery.data?.points && curveQuery.data.points.length > 0) {
      return serverCurveToLocal(curveQuery.data.points);
    }
    return localCurveData;
  }, [curveQuery.data, localCurveData]);

  // Dose markers on the curve
  const doseMarkers = useMemo(
    () =>
      doseEvents.map((de) => {
        const point = curveData.find(
          (p) => Math.abs(p.hour - de.timeHr) < 0.15,
        );
        return {
          hour: de.timeHr,
          mg: de.amountMg,
          level: point?.level ?? 0,
        };
      }),
    [doseEvents, curveData],
  );

  // Current level + trend (use local PK for real-time interpolation)
  const currentLevel = predictAtTime(nowHr, doseEvents, pk);
  const prevLevel = predictAtTime(nowHr - 0.25, doseEvents, pk);
  const trend = deriveTrend(currentLevel, prevLevel);
  const status = deriveStatus(currentLevel, user.targetLevelMgL);

  // Dosing availability
  const remaining = Math.max(doseStore.dailyLimitMg - doseStore.dailyTotalMg, 0);
  const doseAvailable = remaining > 0 && status !== "complete" && !doseRequest.isPending;

  // Cutoff time display
  const cutoffDisplay = doseStore.cutoffTime ?? "---";

  // Handle dose press — calls server, falls back to local
  const handleDose = useCallback(() => {
    if (!doseAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (user.userId) {
      // Call the real API
      doseRequest.mutate(
        {
          user_id: user.userId,
          target_mg_l: user.targetLevelMgL,
        },
        {
          onSuccess: (data) => {
            if (!data.denied && data.amount_mg > 0) {
              // Server approved — record locally
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              doseStore.addDose({
                doseId: `dose-${Date.now()}`,
                amountMg: data.amount_mg,
                timestamp: new Date().toISOString(),
                source: bleStore.connectionState === "connected" ? "device" : "manual",
                confirmed: true,
              });
            } else {
              // Server denied
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
          onError: () => {
            // Server unreachable — fall back to local simulation
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const amountMg = 25;
            doseStore.addDose({
              doseId: `dose-${Date.now()}`,
              amountMg,
              timestamp: new Date().toISOString(),
              source: "manual",
              confirmed: false,
            });
            doseStore.queueForSync({
              doseId: `dose-${Date.now()}`,
              amountMg,
              timestamp: new Date().toISOString(),
              source: "manual",
              confirmed: false,
            });
          },
        },
      );
    } else {
      // No user ID (pre-onboarding) — local simulation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      doseStore.addDose({
        doseId: `dose-${Date.now()}`,
        amountMg: 25,
        timestamp: new Date().toISOString(),
        source: "manual",
        confirmed: true,
      });
    }
  }, [doseAvailable, user.userId, user.targetLevelMgL, doseRequest, doseStore, bleStore.connectionState]);

  // Last dose display and denial reason
  const lastDose = doseStore.doses.length > 0
    ? doseStore.doses[doseStore.doses.length - 1].amountMg
    : undefined;

  const denialReason = doseRequest.data?.denied ? doseRequest.data.reason : undefined;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-text-primary font-dm-sans-semibold text-xl">
            Caffio
          </Text>
          <DeviceStatus
            connected={bleStore.connectionState === "connected"}
            cartridgePercent={bleStore.cartridgePercent}
          />
        </View>

        {/* Cutoff banner */}
        {status === "complete" && (
          <CutoffBanner
            message="Dosing complete for today --- enjoy your evening"
            visible
          />
        )}

        {/* Denial banner */}
        {denialReason && (
          <CutoffBanner
            message={denialReason}
            visible
          />
        )}

        {/* Metric card */}
        <Card className="mb-3 items-center py-5">
          <MetricDisplay
            value={currentLevel.toFixed(1)}
            unit="mg/L"
            trend={trend}
            status={status}
          />
        </Card>

        {/* Caffeine curve chart */}
        <Card className="mb-2 px-2 py-3">
          <Text className="text-text-secondary font-dm-sans text-sm mb-2 px-2">
            Caffeine Curve
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

        {/* Dose button */}
        <DoseButton
          available={doseAvailable}
          lastDoseAmount={lastDose}
          onPress={handleDose}
          loading={doseRequest.isPending}
        />

        {/* Daily stats */}
        <DailyStats
          dailyTotal={doseStore.dailyTotalMg}
          dailyLimit={doseStore.dailyLimitMg}
          doseCount={doseStore.doses.length}
          cutoffTime={cutoffDisplay}
          onPress={toggleDoseLog}
        />

        {/* Dose log */}
        <View className="mt-3">
          <DoseLog
            doses={doseStore.doses}
            expanded={doseLogExpanded}
            onToggle={toggleDoseLog}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
