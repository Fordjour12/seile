import { Tabs } from "expo-router";
import { Image } from "expo-image";
import { PiggyBank, Calendar, Erase } from "iconoir-react-native";

import { TabBarIcon, TabBarIcon2 } from "@/components/tabbar-icon";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const SETTINGS_AVATAR_URL = "https://avatars.githubusercontent.com/u/53586559?v=4";

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
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
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
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={SETTINGS_AVATAR_URL}
              contentFit="cover"
              style={{
                width: size ?? 24,
                height: size ?? 24,
                borderRadius: ((size ?? 24) / 2),
                borderWidth: 2,
                borderColor: focused ? theme.primary : theme.border,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
