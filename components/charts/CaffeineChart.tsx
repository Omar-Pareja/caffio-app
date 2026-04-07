import { View, Text } from "react-native";
import {
  CartesianChart,
  Line,
  Area,
  useChartPressState,
  type ChartPressState,
} from "victory-native";
import {
  Circle,
  Rect,
  vec,
  Text as SkiaText,
  useFont,
  DashPathEffect,
  Line as SkiaLine,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { colors } from "@/lib/theme/tokens";

type CurveChartPressState = ChartPressState<{
  x: number;
  y: { level: number; upper: number; lower: number };
}>;

export interface CurvePoint {
  [key: string]: number;
  hour: number;
  level: number;
  upper: number;
  lower: number;
}

interface DoseMarker {
  hour: number;
  mg: number;
  level: number;
  /** True if this is an externally logged drink (shown as blue dot) */
  isExternal?: boolean;
}

interface CaffeineChartProps {
  curveData: CurvePoint[];
  doseMarkers: DoseMarker[];
  currentHour: number;
  targetLow: number;
  targetHigh: number;
  bedtimeThreshold: number;
}

export function CaffeineChart({
  curveData,
  doseMarkers,
  currentHour,
  targetLow,
  targetHigh,
  bedtimeThreshold,
}: CaffeineChartProps) {
  const font = useFont(require("@/assets/fonts/Inter-Medium.ttf"), 10);
  const { state, isActive } = useChartPressState({
    x: 0 as number,
    y: { level: 0, upper: 0, lower: 0 },
  });

  return (
    <View className="h-56 w-full">
      <CartesianChart
        data={curveData}
        xKey="hour"
        yKeys={["level", "upper", "lower"]}
        domain={{ y: [0, 6] }}
        padding={{ left: 0, right: 0, top: 16, bottom: 0 }}
        domainPadding={{ top: 20, bottom: 10 }}
        chartPressState={state}
        axisOptions={{
          font,
          tickCount: { x: 8, y: 5 },
          lineColor: colors.border,
          labelColor: colors.text.muted,
          formatXLabel: (v) => {
            const raw = Math.round(Number(v));
            const h = raw >= 24 ? raw - 24 : raw;
            if (h === 0) return "12a";
            if (h < 12) return `${h}a`;
            if (h === 12) return "12p";
            return `${h - 12}p`;
          },
          formatYLabel: (v) => `${Number(v).toFixed(1)}`,
        }}
      >
        {({ points, chartBounds, yScale, xScale }) => {
          const targetTop = yScale(targetHigh);
          const targetBottom = yScale(targetLow);
          const thresholdY = yScale(bedtimeThreshold);
          const nowX = xScale(currentHour);

          return (
            <>
              {/* Target zone shaded band */}
              <Rect
                x={chartBounds.left}
                y={targetTop}
                width={chartBounds.right - chartBounds.left}
                height={targetBottom - targetTop}
                color={colors.chart.targetZone}
              />

              {/* Bedtime threshold dashed line */}
              <SkiaLine
                p1={vec(chartBounds.left, thresholdY)}
                p2={vec(chartBounds.right, thresholdY)}
                color={colors.accent.danger}
                strokeWidth={1}
                opacity={0.5}
              >
                <DashPathEffect intervals={[6, 4]} />
              </SkiaLine>

              {/* Confidence band (upper area fill) */}
              <Area
                points={points.upper}
                y0={yScale(0)}
                color={colors.chart.confidenceBand}
                curveType="monotoneX"
              />

              {/* Main caffeine concentration line */}
              <Line
                points={points.level}
                color={colors.accent.primary}
                strokeWidth={2.5}
                curveType="monotoneX"
              />

              {/* Current time "Now" indicator */}
              <SkiaLine
                p1={vec(nowX, chartBounds.top)}
                p2={vec(nowX, chartBounds.bottom)}
                color={colors.text.primary}
                strokeWidth={1}
                opacity={0.6}
              />
              {font && (
                <SkiaText
                  x={nowX - 10}
                  y={chartBounds.top - 4}
                  text="Now"
                  font={font}
                  color={colors.text.secondary}
                />
              )}

              {/* Dose markers — red for Caffio, blue for external drinks */}
              {doseMarkers.map((dose, i) => {
                const cx = xScale(dose.hour);
                const cy = yScale(dose.level);
                return (
                  <Circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={4}
                    color={dose.isExternal ? colors.drink : colors.accent.danger}
                  />
                );
              })}

              {/* Interactive tooltip */}
              {isActive ? (
                <ActiveTooltip state={state} font={font} />
              ) : null}
            </>
          );
        }}
      </CartesianChart>
    </View>
  );
}

function ActiveTooltip({
  state,
  font,
}: {
  state: CurveChartPressState;
  font: ReturnType<typeof useFont>;
}) {
  const x = state.x.position;
  const y = state.y.level.position;

  const label = useDerivedValue(() => {
    const h = Math.round(state.x.value.value as number);
    const period = h >= 12 ? "pm" : "am";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const val = (state.y.level.value.value as number).toFixed(1);
    return `${val} mg/L @ ${displayH}${period}`;
  });

  const labelX = useDerivedValue(() => x.value - 40);
  const labelY = useDerivedValue(() => y.value - 14);

  return (
    <>
      <Circle cx={x} cy={y} r={6} color={colors.accent.primary} opacity={0.3} />
      <Circle cx={x} cy={y} r={3} color={colors.accent.primary} />
      {font && (
        <SkiaText
          x={labelX}
          y={labelY}
          text={label}
          font={font}
          color={colors.text.primary}
        />
      )}
    </>
  );
}
