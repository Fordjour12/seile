import { Tabs } from "expo-router";
import {
  PiggyBank,
  Calendar,
  Erase,
  HospitalCircle,
  HealthShield,
  HomeTable,
} from "iconoir-react-native";

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
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <HomeTable />
            </TabBarIcon2>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <HealthShield />
            </TabBarIcon2>
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <PiggyBank />
            </TabBarIcon2>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <Erase />
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
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
