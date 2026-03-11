import { Tabs } from "expo-router";
import {
  PiggyBank,
  Calendar,
  Erase,
  HealthShield,
  HomeTable,
  Safari,
} from "iconoir-react-native";

import { Avatar } from "@/components";
import { TabBarIcon, TabBarIcon2 } from "@/components/tabbar-icon";
import { NAV_THEME } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const { user, hasHydrated, isLoading } = useAuth();
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
        name="faith"
        options={{
          title: "Faith",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <Safari />
            </TabBarIcon2>
          ),
        }}
      />
      <Tabs.Screen
        name="scheduler"
        options={{
          title: "Scheduler",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <Calendar />
            </TabBarIcon2>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, size }) => (
            <Avatar
              source={
                hasHydrated && !isLoading && user?.image
                  ? { uri: user.image }
                  : undefined
              }
              fallback={user?.name ?? user?.email ?? "Settings"}
              size="sm"
              style={{
                borderWidth: 2,
                borderColor: focused ? theme.primary : theme.border,
                transform: [{ scale: (size ?? 24) / 32 }],
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
