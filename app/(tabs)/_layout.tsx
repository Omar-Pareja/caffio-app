import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#131316",
          borderTopColor: "#2A2A30",
        },
        tabBarActiveTintColor: "#4ECDC4",
        tabBarInactiveTintColor: "#636366",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: "Schedule" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}
