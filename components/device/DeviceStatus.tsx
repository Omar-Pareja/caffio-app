import { View, Text } from "react-native";

interface DeviceStatusProps {
  connected: boolean;
  cartridgePercent: number;
}

export function DeviceStatus({ connected, cartridgePercent }: DeviceStatusProps) {
  return (
    <View className="flex-row items-center gap-3">
      {/* Connection dot */}
      <View className="flex-row items-center gap-1.5">
        <View
          className={`h-2 w-2 rounded-full ${connected ? "bg-accent-success" : "bg-accent-danger"}`}
        />
        <Text className="text-text-muted font-inter text-xs">
          {connected ? "Connected" : "Offline"}
        </Text>
      </View>

      {/* Cartridge level */}
      <View className="flex-row items-center gap-1.5">
        <View className="h-3 w-5 rounded-sm border border-text-muted overflow-hidden">
          <View
            className="h-full bg-accent-primary"
            style={{ width: `${cartridgePercent}%` }}
          />
        </View>
        <Text className="text-text-muted font-inter text-xs">
          {cartridgePercent}%
        </Text>
      </View>
    </View>
  );
}
