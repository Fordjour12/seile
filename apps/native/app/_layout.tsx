import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexProviderWithAuth } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { convex } from "@/lib/convex-client";

import { NAV_THEME } from "@/lib/constants";
import { SchedulerAppSync } from "@/lib/scheduler/use-scheduler-app-sync";
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
  initialRouteName: "(tabs)",
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
    <ConvexProviderWithAuth client={convex} useAuth={useBetterAuthForConvex}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <KeyboardProvider>
            <AuthProvider>
              <BottomSheetModalProvider>
                <AuthenticatedAppEffects />
                <StackLayout />
              </BottomSheetModalProvider>
              <Toaster />
            </AuthProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ConvexProviderWithAuth>
  );
}

function useBetterAuthForConvex() {
  const { data: session, isPending } = authClient.useSession();
  const sessionId = session?.session?.id;
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const pendingTokenRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    if (!session && !isPending && cachedToken) {
      setCachedToken(null);
    }
  }, [cachedToken, isPending, session]);

  const fetchAccessToken = useCallback(
    async ({
      forceRefreshToken = false,
    }: {
      forceRefreshToken?: boolean;
    } = {}) => {
      if (cachedToken && !forceRefreshToken) {
        return cachedToken;
      }

      if (!forceRefreshToken && pendingTokenRef.current) {
        return pendingTokenRef.current;
      }

      pendingTokenRef.current = authClient.convex
        .token({ fetchOptions: { throw: false } })
        .then(({ data }) => {
          const token = data?.token ?? null;
          setCachedToken(token);
          return token;
        })
        .catch(() => {
          setCachedToken(null);
          return null;
        })
        .finally(() => {
          pendingTokenRef.current = null;
        });

      return pendingTokenRef.current;
    },
    [cachedToken, sessionId],
  );

  return useMemo(
    () => ({
      isLoading: isPending && !cachedToken,
      isAuthenticated: Boolean(session?.session) || cachedToken !== null,
      fetchAccessToken,
    }),
    [cachedToken, fetchAccessToken, isPending, session?.session],
  );
}

function StackLayout() {
  const router = useRouter();
  const { user, hasHydrated, isLoading } = useAuth();
  const isReady = hasHydrated && !isLoading;
  const isLoggedIn = Boolean(user);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isLoggedIn) {
      wasAuthenticatedRef.current = true;
      return;
    }

    if (wasAuthenticatedRef.current) {
      router.replace("/(auth)/sign-in");
      wasAuthenticatedRef.current = false;
    }
  }, [isLoggedIn, isReady, router]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen
          name="(tabs)"
          options={{ title: "Tabs", headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ title: "Modal", presentation: "modal" }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen
          name="(auth)"
          options={{ title: "Auth", headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
}

function AuthenticatedAppEffects() {
  const { user, hasHydrated, isLoading } = useAuth();

  if (!hasHydrated || isLoading || !user) {
    return null;
  }

  return <SchedulerAppSync />;
}
