import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { env } from "@seile/env/native";
import { Toaster } from "sonner-native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LockScreen } from "@/components/lock-screen";
import { SchedulerAppSync } from "@/lib/scheduler/use-scheduler-app-sync";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function AppContent() {
  const { isLocked, isLoading } = useAuth();
  const { isDarkColorScheme } = useColorScheme();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ title: "Tabs", headerShown: false }}
              />
              <Stack.Screen
                name="modal"
                options={{ title: "Modal", presentation: "modal" }}
              />
            </Stack>
          </BottomSheetModalProvider>
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: require("../assets/fonts/Geist/Geist-Regular.ttf"),
    "Geist-Medium": require("../assets/fonts/Geist/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist/Geist-SemiBold.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist/Geist-Bold.ttf"),
    Figtree: require("../assets/fonts/Figtree/Figtree-Regular.ttf"),
    "Figtree-Italic": require("../assets/fonts/Figtree/Figtree-Italic.ttf"),
    "Figtree-Medium": require("../assets/fonts/Figtree/Figtree-Medium.ttf"),
    "Figtree-MediumItalic": require("../assets/fonts/Figtree/Figtree-MediumItalic.ttf"),
    "Figtree-SemiBold": require("../assets/fonts/Figtree/Figtree-SemiBold.ttf"),
    "Figtree-SemiBoldItalic": require("../assets/fonts/Figtree/Figtree-SemiBoldItalic.ttf"),
    "Figtree-Bold": require("../assets/fonts/Figtree/Figtree-Bold.ttf"),
    "Figtree-BoldItalic": require("../assets/fonts/Figtree/Figtree-BoldItalic.ttf"),
    Manrope: require("../assets/fonts/Manrope/Manrope-Regular.ttf"),
    "Manrope-Medium": require("../assets/fonts/Manrope/Manrope-Medium.ttf"),
    "Manrope-SemiBold": require("../assets/fonts/Manrope/Manrope-SemiBold.ttf"),
    "Manrope-Bold": require("../assets/fonts/Manrope/Manrope-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <View style={StyleSheet.absoluteFill}>
          <SchedulerAppSync />
          <AppContent />
          <AuthGate />
        </View>
      </AuthProvider>
    </ConvexProvider>
  );
}

function AuthGate() {
  const { isLocked } = useAuth();
  const { isDarkColorScheme } = useColorScheme();

  if (!isLocked) {
    return null;
  }

  const overlayStyle = StyleSheet.flatten([
    StyleSheet.absoluteFill,
    {
      backgroundColor: isDarkColorScheme
        ? NAV_THEME.dark.background
        : NAV_THEME.light.background,
      zIndex: 9999,
    },
  ]);

  return (
    <View style={overlayStyle}>
      <LockScreen />
    </View>
  );
}
