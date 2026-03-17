import { useState } from "react";
import { Alert as RNAlert, Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type SurfaceId =
  | "lock-briefing"
  | "lock-stack"
  | "banner-approval"
  | "banner-briefing"
  | "banner-review"
  | "center";

const SURFACES: Array<{ id: SurfaceId; label: string }> = [
  { id: "lock-briefing", label: "Lock briefing" },
  { id: "lock-stack", label: "Lock stack" },
  { id: "banner-approval", label: "Approval banner" },
  { id: "banner-briefing", label: "Morning banner" },
  { id: "banner-review", label: "Review banner" },
  { id: "center", label: "Notification center" },
];

const CENTER_ITEMS = [
  {
    id: "approval",
    title: "AI wants to make a change",
    subtitle: "Finance · Create emergency fund · GHc 400/month",
    time: "9:30 AM",
    color: "#ba7517",
    background: "rgba(186, 117, 23, 0.14)",
    unread: true,
  },
  {
    id: "briefing",
    title: "Good morning · 3 priorities today",
    subtitle: "Faith 85% · 1 approval pending · 4 habits due",
    time: "8:00 AM",
    color: "#9b8fff",
    background: "rgba(123, 109, 246, 0.14)",
    unread: false,
  },
  {
    id: "checkin",
    title: "Morning check-in · 30 seconds",
    subtitle: "Mood, energy, focus · feeds your week plan",
    time: "8:30 AM",
    color: "#ed93b1",
    background: "rgba(212, 83, 126, 0.14)",
    unread: true,
  },
  {
    id: "habits",
    title: "2 habits still unchecked",
    subtitle: "Gratitude log · No spend · tap to log quickly",
    time: "7:00 PM",
    color: "#1d9e75",
    background: "rgba(31, 169, 127, 0.14)",
    unread: true,
  },
  {
    id: "review",
    title: "Weekly review ready · 8 min",
    subtitle: "Faith 85% · Career 90% · Finance needs attention",
    time: "8:00 PM",
    color: "#1d9e75",
    background: "rgba(31, 169, 127, 0.14)",
    unread: true,
  },
];

export function NotificationsScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [surface, setSurface] = useState<SurfaceId>("center");

  function showStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Notification surfaces
          </Text>
          <View style={{ gap: 4 }}>
            <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700", lineHeight: 32 }}>
              Life OS notifications
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              Preview lock-screen alerts, in-app banners, and the notifications center.
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SURFACES.map((item) => {
              const active = item.id === surface;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSurface(item.id)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                    borderWidth: 1,
                    borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(420)}>
          {surface === "lock-briefing" ? <LockScreenBriefing onAction={showStub} /> : null}
          {surface === "lock-stack" ? <LockScreenStack /> : null}
          {surface === "banner-approval" ? <BannerSurface mode="approval" /> : null}
          {surface === "banner-briefing" ? <BannerSurface mode="briefing" /> : null}
          {surface === "banner-review" ? <BannerSurface mode="review" /> : null}
          {surface === "center" ? <NotificationCenterPreview onAction={showStub} /> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(420)}>
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              padding: 14,
              gap: 8,
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(61, 53, 112, 0.34)" : "rgba(61, 53, 112, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
            }}
          >
            <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              Current design intent
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              Morning briefing uses the purple Life OS tone, approvals use amber, habits and weekly review lean green, and check-ins stay in the wellness pink lane. Every surface keeps the message short enough to scan in under two seconds.
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

function LockScreenBriefing({
  onAction,
}: {
  onAction: (title: string, message: string) => void;
}) {
  return (
    <PhoneShell wallpaper>
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}>
        <LockNotificationCard
          expanded
          color="#9b8fff"
          app="Life OS · Morning briefing"
          title="Good morning, Bobie."
          body="3 priorities · 4 habits · 1 approval pending · Faith 85% this week"
          time="8:00"
          actions={[
            { label: "Open Today", tone: "primary", onPress: () => onAction("Open Today", "This preview would open the Today screen from the lock-screen briefing.") },
            { label: "Dismiss", tone: "ghost", onPress: () => onAction("Dismiss", "This preview would dismiss the morning briefing.") },
          ]}
        />
      </View>
    </PhoneShell>
  );
}

function LockScreenStack() {
  return (
    <PhoneShell wallpaper time="9:41" date="Friday, March 14">
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}>
        <LockNotificationCard color="#ba7517" app="Life OS · Approval" title="AI wants to make a change" body="Create emergency fund · GHc 400/month · Finance domain" time="9:30" />
        <LockNotificationCard color="#ed93b1" app="Life OS · Habits" title="2 habits still unchecked" body="Gratitude log · No spend day · tap to log" time="7:00 PM" />
        <LockNotificationCard color="#1d9e75" app="Life OS · Weekly review" title="Your week is ready to review" body="Faith 85% · Career 90% · Finance needs attention" time="8:00 PM" />
      </View>
    </PhoneShell>
  );
}

function BannerSurface({
  mode,
}: {
  mode: "approval" | "briefing" | "review";
}) {
  const banner =
    mode === "approval"
      ? {
          color: "#ba7517",
          app: "Life OS · Finance",
          title: "AI wants to make a change",
          body: "Create emergency fund · GHc 400/mo",
          time: "now",
        }
      : mode === "briefing"
        ? {
            color: "#9b8fff",
            app: "Life OS · Morning briefing",
            title: "Good morning · 3 priorities today",
            body: "Faith 85% · 1 approval pending · energy sync at 6 AM",
            time: "8:00",
          }
        : {
            color: "#1d9e75",
            app: "Life OS · Weekly review",
            title: "Your week is ready · 8 min review",
            body: "Faith 85% · Career 90% · Finance needs attention",
            time: "8:00 PM",
          };

  return (
    <Card
      style={{
        borderRadius: 28,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "#2a2a2e",
        backgroundColor: "#0e0e10",
        overflow: "hidden",
        padding: 0,
      }}
    >
      <View style={{ paddingTop: 14, paddingHorizontal: 28, flexDirection: "row", justifyContent: "space-between" }}>
        <Text selectable variant="muted" style={{ color: "#ffffff" }}>
          {banner.time}
        </Text>
        <Text selectable variant="muted" style={{ color: "#ffffff" }}>
          ▮▮▮
        </Text>
      </View>
      <View style={{ padding: 24, paddingTop: 18, minHeight: 220, justifyContent: "flex-start" }}>
        <View style={{ gap: 10, marginTop: 72, opacity: 0.42 }}>
          <View style={{ width: "60%", height: 10, borderRadius: 999, backgroundColor: "#1a1a1e" }} />
          <GhostCard />
          <GhostCard />
        </View>
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            borderRadius: 18,
            borderCurve: "continuous",
            backgroundColor: "rgba(20, 18, 28, 0.96)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            padding: 14,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${banner.color}22`,
              borderWidth: 1,
              borderColor: `${banner.color}33`,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: banner.color }} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              {banner.app}
            </Text>
            <Text selectable variant="small" style={{ color: "#ffffff", fontFamily: "Geist", fontWeight: "700" }}>
              {banner.title}
            </Text>
            <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 18 }}>
              {banner.body}
            </Text>
          </View>
          <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.28)" }}>
            {banner.time}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function NotificationCenterPreview({
  onAction,
}: {
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 28,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "#2a2a2e",
        backgroundColor: "#0a0a10",
        overflow: "hidden",
        paddingVertical: 0,
      }}
    >
      <View style={{ alignItems: "center", paddingTop: 44, paddingBottom: 16 }}>
        <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 30, fontWeight: "300" }}>
          9:41
        </Text>
        <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.4)" }}>
          Friday · March 14
        </Text>
      </View>

      <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.35)", paddingHorizontal: 20, marginBottom: 8 }}>
        Life OS
      </Text>

      <View style={{ paddingHorizontal: 16, paddingBottom: 18, gap: 6 }}>
        {CENTER_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onAction(item.title, `This preview would open the ${item.title.toLowerCase()} notification target.`)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.84 : item.unread ? 1 : 0.5,
            })}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                padding: 14,
                borderRadius: 16,
                borderCurve: "continuous",
                backgroundColor: "rgba(28,26,38,0.9)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: item.background,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: item.color }} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                  <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                    {item.title}
                  </Text>
                  <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {item.time}
                  </Text>
                </View>
                <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.48)", lineHeight: 18 }}>
                  {item.subtitle}
                </Text>
              </View>
              {item.unread ? <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: item.color, marginTop: 5 }} /> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function PhoneShell({
  children,
  wallpaper,
  time = "8:00",
  date = "Tuesday, March 14",
}: {
  children: React.ReactNode;
  wallpaper?: boolean;
  time?: string;
  date?: string;
}) {
  return (
    <Card
      style={{
        borderRadius: 28,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "#2a2a2e",
        backgroundColor: wallpaper ? "#0a0a10" : "#0e0e10",
        overflow: "hidden",
        padding: 0,
      }}
    >
      <View
        style={{
          paddingTop: 40,
          paddingBottom: 24,
          alignItems: "center",
          backgroundColor: wallpaper ? "#0a0816" : "#0e0e10",
        }}
      >
        <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 56, fontWeight: "300", lineHeight: 58 }}>
          {time}
        </Text>
        <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.5)" }}>
          {date}
        </Text>
      </View>
      {children}
    </Card>
  );
}

function LockNotificationCard({
  expanded,
  color,
  app,
  title,
  body,
  time,
  actions,
}: {
  expanded?: boolean;
  color: string;
  app: string;
  title: string;
  body: string;
  time: string;
  actions?: Array<{ label: string; tone: "primary" | "ghost"; onPress: () => void }>;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 14,
        gap: expanded ? 10 : 0,
        backgroundColor: "rgba(30,28,40,0.88)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${color}22`,
            borderWidth: 1,
            borderColor: `${color}33`,
          }}
        >
          <View style={{ width: 11, height: 11, borderRadius: 999, backgroundColor: color }} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: color }} />
            <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Geist", fontWeight: "700" }}>
              {app}
            </Text>
          </View>
          <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Geist", fontWeight: "700" }}>
            {title}
          </Text>
          <Text selectable variant="small" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 19 }}>
            {body}
          </Text>
        </View>
        <Text selectable variant="muted" style={{ color: "rgba(255,255,255,0.3)" }}>
          {time}
        </Text>
      </View>

      {expanded && actions?.length ? (
        <View style={{ flexDirection: "row", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 12,
                borderCurve: "continuous",
                backgroundColor: action.tone === "primary" ? "rgba(155,143,255,0.25)" : "rgba(255,255,255,0.07)",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text selectable variant="small" style={{ color: action.tone === "primary" ? "#c8c0ff" : "rgba(255,255,255,0.45)", fontFamily: "Geist", fontWeight: "700" }}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function GhostCard() {
  return (
    <View
      style={{
        borderRadius: 14,
        borderCurve: "continuous",
        padding: 14,
        backgroundColor: "#1a1a1e",
        gap: 6,
      }}
    >
      <View style={{ width: "82%", height: 9, borderRadius: 999, backgroundColor: "#222226" }} />
      <View style={{ width: "58%", height: 9, borderRadius: 999, backgroundColor: "#222226" }} />
    </View>
  );
}
