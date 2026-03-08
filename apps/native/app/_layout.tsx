import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { Toaster } from "sonner-native";
import { ConvexProvider, useConvexAuth } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { authClient, useSession } from "@/lib/auth-client";
import { bootstrapUserData } from "@/lib/bootstrap-user-data";
import { convex } from "@/lib/convex-client";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

function SessionBootstrapper() {
  const { isAuthenticated } = useConvexAuth();
  const { data: session } = useSession();

  useEffect(() => {
    if (!isAuthenticated || !session?.session?.id) {
      return;
    }

    void bootstrapUserData().catch(() => {
      // Keep startup resilient; the auth screens and diagnostics surface manual retry.
    });
  }, [isAuthenticated, session?.session?.id]);

  return null;
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isDarkColorScheme } = useColorScheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor: isDarkColorScheme
              ? NAV_THEME.dark.background
              : NAV_THEME.light.background,
          },
        ]}
      >
        <ActivityIndicator
          color={isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary}
          size="large"
        />
      </View>
    );
  }

  return (
    <Stack>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="(tabs)"
            options={{ title: "Tabs", headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ title: "Modal", presentation: "modal" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{ title: "Auth", headerShown: false }}
        />
      )}
    </Stack>
  );
}

function AppContent() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <SessionBootstrapper />
          <RootNavigator />
        </BottomSheetModalProvider>
        <Toaster />
      </GestureHandlerRootView>
    </ThemeProvider>
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
      <ConvexBetterAuthProvider authClient={authClient} client={convex}>
        <AppContent />
      </ConvexBetterAuthProvider>
    </ConvexProvider>
  );
}
