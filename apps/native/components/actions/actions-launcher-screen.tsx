import { Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const ACTIONS = [
  {
    key: "quick-add",
    title: "Quick Add Sheet",
    subtitle: "Task, habit, expense, prayer, and note entry with contextual metadata.",
    route: "/actions/quick-add",
    icon: "plus",
    color: "#9b8fff",
    background: "rgba(123, 109, 246, 0.16)",
    badge: "Sheet",
  },
  {
    key: "approval",
    title: "Approval Sheet",
    subtitle: "Bottom-sheet approvals for finance, faith, and health agent proposals.",
    route: "/actions/approval",
    icon: "check-square-o",
    color: "#7cd9aa",
    background: "rgba(31, 169, 127, 0.14)",
    badge: "Approval",
  },
  {
    key: "preview",
    title: "Action Preview Modal",
    subtitle: "Agent execution trace with scenario switching and preview state.",
    route: "/actions/preview",
    icon: "clone",
    color: "#f0a07b",
    background: "rgba(208, 122, 54, 0.14)",
    badge: "Modal",
  },
] as const;

export function ActionsLauncherScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 36,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 12 }}>
          <Card
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <View style={{ gap: 4, flex: 1 }}>
                <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  Action surfaces
                </Text>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 20, fontWeight: "700" }}>
                  Native overlays and sheets
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  View the three action UI mocks in app: quick add, approval, and execution preview.
                </Text>
              </View>
              <Badge color="primary">3 views</Badge>
            </View>
          </Card>
        </Animated.View>

        {ACTIONS.map((item, index) => (
          <Animated.View key={item.key} entering={FadeInDown.delay(50 + index * 45).duration(420)}>
            <Pressable onPress={() => router.push(item.route as never)} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
              <Card
                style={{
                  borderRadius: 20,
                  borderCurve: "continuous",
                  padding: 16,
                  gap: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  boxShadow: theme.shadowSm,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: item.background }}>
                    <FontAwesome name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                        {item.title}
                      </Text>
                      <Badge variant="outline" color="secondary">{item.badge}</Badge>
                    </View>
                    <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                      {item.subtitle}
                    </Text>
                    <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                      Open
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </Container>
  );
}
