import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", children, ...rest }: CardProps) {
  const bg = elevated ? "bg-surface-elevated" : "bg-surface";

  return (
    <View
      className={`rounded-2xl ${bg} border border-border p-4 ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
