import { Tabs } from "expo-router";
import {
  Erase,
  HomeTable,
  Bridge3d,
  ProjectCurve3d,
} from "iconoir-react-native";

import { Avatar } from "@/components";
import { TabBarIcon2, TabBarIcon } from "@/components/tabbar-icon";
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
        name="balance"
        options={{
          title: "Balance",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <ProjectCurve3d />
            </TabBarIcon2>
          ),
        }}
      />

      <Tabs.Screen
        name="domains"
        options={{
          title: "Domains",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bullseye" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <Bridge3d />
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
