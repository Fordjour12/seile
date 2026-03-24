import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { authClient } from "@/lib/auth-client";
import { AuthProvider } from "@/lib/auth-context";
import { convex } from "@/lib/convex-client";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();

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
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <KeyboardProvider>
            <AuthProvider>
              <BottomSheetModalProvider>
                <StackLayout />
              </BottomSheetModalProvider>
              <Toaster />
            </AuthProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ConvexBetterAuthProvider>
  );
}
function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
