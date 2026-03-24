import { Card, Text } from "@/components/ui";
import { FirstRunCompleteScreen } from "@/components/first-run-v2/first-run-complete-screen";
import { Container } from "@/components/container";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { ScrollView, View } from "react-native";

export default function Index() {
  const { stage } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  if (stage === "first-run") {
    return <FirstRunCompleteScreen />;
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          paddingBottom: 120,
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
        }}
      >
        <View style={{ gap: 6 }}>
          <Text
            selectable
            variant="muted"
            style={{
              color: theme.mutedForeground,
              fontFamily: "Geist",
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Today
          </Text>
          <Text selectable variant="h3" style={{ color: theme.foreground }}>
            Weekly review unlocked.
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            First run is complete. The app now opens directly into your normal
            tabs with AI suggestions based on your real patterns.
          </Text>
        </View>

        <Card
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
          }}
        >
          <Text
            selectable
            variant="small"
            style={{
              color: theme.foreground,
              fontFamily: "Geist",
              fontWeight: "700",
            }}
          >
            What changed
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            Your planner can now generate full weekly plans, approvals unlock
            from real activity, and domains are no longer operating from setup
            defaults.
          </Text>
        </Card>

        <Card
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
          }}
        >
          <Text
            selectable
            variant="small"
            style={{
              color: theme.foreground,
              fontFamily: "Geist",
              fontWeight: "700",
            }}
          >
            Next surfaces
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            Use Planner to review the week, Domains to deepen setup, and Today
            to keep feeding the AI new signal.
          </Text>
        </Card>
      </ScrollView>
    </Container>
  );
}
