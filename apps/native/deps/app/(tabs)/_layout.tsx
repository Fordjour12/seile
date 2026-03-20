import { Tabs } from "expo-router";
import { HomeTable, Spark } from "iconoir-react-native";

import { TabBarIcon2 } from "@/components/tabbar-icon";
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
        name="hello"
        options={{
          title: "Test",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon2 color={color} width={size}>
              <Spark />
            </TabBarIcon2>
          ),
        }}
      />
    </Tabs>
  );
}
