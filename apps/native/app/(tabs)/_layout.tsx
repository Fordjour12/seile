import { Tabs } from "expo-router";
import { PiggyBank, Calendar } from "iconoir-react-native";

import { TabBarIcon, TabBarIcon2 } from "@/components/tabbar-icon";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="compass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: "Components",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="th-large" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon2 color={color}>
              <PiggyBank />
            </TabBarIcon2>
          ),
        }}
      />
      <Tabs.Screen
        name="scheduler"
        options={{
          title: "Scheduler",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon2 color={color}>
              <Calendar />
            </TabBarIcon2>
          ),
        }}
      />
      <Tabs.Screen
        name="auth-smoke"
        options={{
          title: "Session",
          tabBarIcon: ({ color }) => <TabBarIcon name="shield" color={color} />,
        }}
      />
    </Tabs>
  );
}
