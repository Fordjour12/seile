import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Alert as RNAlert, Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import type { ThemeScale } from "@/lib/constants/types";
import { useColorScheme } from "@/lib/use-color-scheme";

type ScenarioId =
  | "cronFailed"
  | "offline"
  | "emptyDomain"
  | "aiFailed"
  | "noDataYet"
  | "approvalExpired"
  | "writeError";

type LoadingStateId = "domainLoading" | "aiGenerating" | "checkinSaving" | "approvalExecuting";

const SCENARIOS: Array<{
  id: ScenarioId;
  label: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: "cronFailed",
    label: "Cron failed",
    eyebrow: "Today fallback",
    title: "Context sync failed",
    subtitle: "Priorities and insights can fall back gracefully when the early-morning cron run misses.",
  },
  {
    id: "offline",
    label: "Offline",
    eyebrow: "Limited mode",
    title: "Last-synced plan",
    subtitle: "Cached priorities and local completion should still feel trustworthy while the device is disconnected.",
  },
  {
    id: "emptyDomain",
    label: "Empty domain",
    eyebrow: "First-use state",
    title: "First data prompt",
    subtitle: "New domains need a clear first action instead of a blank wall.",
  },
  {
    id: "aiFailed",
    label: "AI failed",
    eyebrow: "Plan generation",
    title: "Temporary AI failure",
    subtitle: "Failed generation should explain the break without making the system feel unsafe.",
  },
  {
    id: "noDataYet",
    label: "Still learning",
    eyebrow: "Early AI state",
    title: "Insufficient data",
    subtitle: "The app should explain why personalization is light in the first few days.",
  },
  {
    id: "approvalExpired",
    label: "Approval expired",
    eyebrow: "Inbox cleanup",
    title: "Proposal timed out",
    subtitle: "Expired approvals should close the loop and show that nothing changed.",
  },
  {
    id: "writeError",
    label: "Write error",
    eyebrow: "Approval failure",
    title: "Write did not complete",
    subtitle: "Post-approval failures need recovery steps and a strong guarantee about clean state.",
  },
];

const LOADING_STATES: Array<{
  id: LoadingStateId;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  tone: "purple" | "amber" | "rose";
  actionLabel?: string;
}> = [
  {
    id: "domainLoading",
    label: "Domain loading",
    title: "Pulling fresh domain state",
    subtitle: "Structure first, then content.",
    accent: "#9b8fff",
    tone: "purple",
  },
  {
    id: "aiGenerating",
    label: "AI generating",
    title: "Generating your plan",
    subtitle: "Reading context across all domains.",
    accent: "#9b8fff",
    tone: "purple",
    actionLabel: "Stop",
  },
  {
    id: "checkinSaving",
    label: "Check-in saving",
    title: "Logging check-in",
    subtitle: "Saving to Wellness domain.",
    accent: "#c8c0ff",
    tone: "purple",
  },
  {
    id: "approvalExecuting",
    label: "Approval executing",
    title: "Writing to Planner",
    subtitle: "Approved change in progress.",
    accent: "#ba7517",
    tone: "amber",
    actionLabel: "Pause",
  },
];

export function ErrorEdgeStatesScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [scenario, setScenario] = useState<ScenarioId>("cronFailed");

  const current = useMemo(
    () => SCENARIOS.find((item) => item.id === scenario) ?? SCENARIOS[0],
    [scenario],
  );

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
            {current.eyebrow}
          </Text>
          <View style={{ gap: 4 }}>
            <Text
              selectable
              style={{
                color: theme.foreground,
                fontFamily: "Geist",
                fontSize: 28,
                fontWeight: "700",
                lineHeight: 32,
              }}
            >
              {current.title}
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {current.subtitle}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SCENARIOS.map((item) => {
              const active = item.id === scenario;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setScenario(item.id)}
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
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: active ? "#c8c0ff" : theme.mutedForeground,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(420)}>
          {scenario === "cronFailed" ? (
            <CronFailedState theme={theme} onAction={showStub} />
          ) : null}
          {scenario === "offline" ? (
            <OfflineState theme={theme} onAction={showStub} />
          ) : null}
          {scenario === "emptyDomain" ? (
            <EmptyDomainState theme={theme} onAction={showStub} />
          ) : null}
          {scenario === "aiFailed" ? (
            <AiFailedState theme={theme} onAction={showStub} />
          ) : null}
          {scenario === "noDataYet" ? (
            <NoDataYetState theme={theme} />
          ) : null}
          {scenario === "approvalExpired" ? (
            <ApprovalExpiredState theme={theme} onAction={showStub} />
          ) : null}
          {scenario === "writeError" ? (
            <WriteErrorState theme={theme} onAction={showStub} />
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ gap: 4, flex: 1 }}>
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
                Loading states
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Use these when the app is doing real work and blank screens would feel broken.
              </Text>
            </View>
            <Badge variant="outline" color="secondary">
              4 variants
            </Badge>
          </View>

          <View style={{ gap: 10 }}>
            {LOADING_STATES.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(120 + index * 30).duration(420)}>
                <LoadingStateCard item={item} theme={theme} isDarkColorScheme={isDarkColorScheme} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

function CronFailedState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 14,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Banner
        tone="red"
        title="Insights unavailable"
        subtitle="Daily context sync failed at 6:00 AM. Priorities may be using yesterday's context."
        badge="6:00 AM"
      />

      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 24, fontWeight: "700" }}>
          Good morning, Bobie.
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
          Your plan is safe. The sync can be retried without data loss.
        </Text>
      </View>

      <Card
        style={{
          borderRadius: 18,
          borderCurve: "continuous",
          padding: 14,
          gap: 10,
          backgroundColor: "rgba(58, 26, 26, 0.28)",
          borderWidth: 1,
          borderColor: "rgba(226, 75, 74, 0.28)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#e24b4a" }} />
          <Text selectable variant="small" style={{ color: "#f2b0b0", fontFamily: "Geist", fontWeight: "700" }}>
            Daily context sync failed
          </Text>
          <Badge variant="outline" color="secondary">
            Today
          </Badge>
        </View>
        <Text selectable variant="small" style={{ color: "#be8a8a", lineHeight: 20 }}>
          The 6 AM cron job did not complete. AI suggestions may be stale, but nothing was lost and your plan remains usable.
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            title="Retry sync"
            onPress={() => onAction("Retry sync", "This preview would manually trigger the daily context sync.")}
            style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }}
          />
          <Button
            title="Use yesterday"
            variant="outline"
            onPress={() => onAction("Use yesterday", "This preview would keep yesterday's suggestions visible until sync recovers.")}
            style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }}
          />
        </View>
      </Card>

      <GhostPlanCard theme={theme} label="Suggestion block" />
      <Text selectable variant="muted" style={{ color: theme.mutedForeground, textAlign: "center" }}>
        Suggestions resume automatically after the next successful sync.
      </Text>
    </Card>
  );
}

function OfflineState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 14,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Banner
        tone="amber"
        title="Offline"
        subtitle="Last synced 2 hours ago. Showing cached priorities until you reconnect."
        badge="Cached"
      />

      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 24, fontWeight: "700" }}>
          Good morning, Bobie.
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
          You can still complete priorities and log habits. Sync resumes automatically.
        </Text>
      </View>

      <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 10, borderWidth: 1, borderColor: theme.border }}>
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
          Today&apos;s priorities · cached
        </Text>
        <PriorityRow label="Morning devotional + Bible reading" />
        <PriorityRow label="Life OS career domain screen" />
        <PriorityRow label="Q2 budget variance review" />
      </Card>

      <Card
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 14,
          gap: 8,
          backgroundColor: "rgba(186, 117, 23, 0.14)",
          borderWidth: 1,
          borderColor: "rgba(186, 117, 23, 0.24)",
        }}
      >
        <Text selectable variant="small" style={{ color: "#d2ac6d", fontFamily: "Geist", fontWeight: "700" }}>
          Limited mode
        </Text>
        <Text selectable variant="small" style={{ color: "#aa8c5f", lineHeight: 20 }}>
          AI suggestions, approvals, and syncing are paused. Local progress remains available.
        </Text>
      </Card>

      <Button
        title="See cached plan details"
        variant="outline"
        onPress={() => onAction("Cached plan", "This preview would open the detailed offline plan view.")}
        style={{ borderRadius: 12, borderCurve: "continuous" }}
      />
    </Card>
  );
}

function EmptyDomainState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 16,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
      }}
    >
      <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#185FA5" }} />
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 22, fontWeight: "700" }}>
          Relationships
        </Text>
      </View>

      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(24, 95, 165, 0.12)",
          borderWidth: 1,
          borderColor: "rgba(24, 95, 165, 0.22)",
        }}
      >
        <FontAwesome name="users" size={24} color="#378add" />
      </View>

      <View style={{ gap: 8, alignItems: "center" }}>
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 22, fontWeight: "700" }}>
          No one added yet
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20, textAlign: "center" }}>
          Add the people who matter. The AI can help you stay in touch once the first relationship data exists.
        </Text>
      </View>

      <View style={{ width: "100%", gap: 8 }}>
        <Button
          title="Add your first person"
          onPress={() => onAction("Add first person", "This preview would launch the first Relationships person flow.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
        <Button
          title="How it works"
          variant="outline"
          onPress={() => onAction("How it works", "This preview would explain how the Relationships domain learns and reminds.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
      </View>
    </Card>
  );
}

function AiFailedState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 16,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
      }}
    >
      <Text selectable variant="small" style={{ color: theme.mutedForeground, alignSelf: "stretch" }}>
        AI · Plan session
      </Text>

      <StateIcon background="rgba(34, 34, 40, 0.9)" borderColor="rgba(85, 85, 95, 0.28)" icon="exclamation-circle" iconColor="#88889a" />

      <View style={{ gap: 8, alignItems: "center" }}>
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 22, fontWeight: "700" }}>
          Plan couldn&apos;t be generated
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20, textAlign: "center" }}>
          The AI ran into a temporary issue while reading your context. Your data is still intact.
        </Text>
      </View>

      <Card style={{ width: "100%", borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 6, borderWidth: 1, borderColor: theme.border }}>
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
          What failed
        </Text>
        <Text selectable variant="small" style={{ color: theme.foreground, lineHeight: 20 }}>
          Context aggregation · step 3 of 5 · domain health scoring
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
          Error ID: cx-0314-88f · auto-retry on next sync
        </Text>
      </Card>

      <View style={{ width: "100%", gap: 8 }}>
        <Button
          title="Try again"
          onPress={() => onAction("Retry generation", "This preview would restart the weekly plan generation session.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
        <Button
          title="Use last week's context"
          variant="outline"
          onPress={() => onAction("Use last week", "This preview would generate the plan from the last successful context snapshot.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
      </View>
    </Card>
  );
}

function NoDataYetState({ theme }: { theme: ThemeScale }) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 14,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 24, fontWeight: "700" }}>
          Good morning, Bobie.
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
          Day 2 · still learning
        </Text>
      </View>

      <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 10, borderWidth: 1, borderColor: theme.border }}>
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
          Today&apos;s priorities
        </Text>
        <PriorityDetail
          title="Morning devotional + prayer"
          subtitle="Faith · suggested by AI"
          color="#b4adf5"
          background="#2a2040"
        />
        <PriorityDetail
          title="Log your first check-in"
          subtitle="Wellness · helps AI learn"
          color="#ed93b1"
          background="#2a1020"
        />
      </Card>

      <Card
        style={{
          borderRadius: 18,
          borderCurve: "continuous",
          padding: 14,
          gap: 8,
          backgroundColor: "rgba(61, 53, 112, 0.18)",
          borderWidth: 1,
          borderColor: "rgba(61, 53, 112, 0.26)",
        }}
      >
        <Text selectable variant="small" style={{ color: "#bfb7ff", fontFamily: "Geist", fontWeight: "700" }}>
          Building your context
        </Text>
        <Text selectable variant="small" style={{ color: "#b1adc8", lineHeight: 20 }}>
          I have 1 day of data. After 3 to 5 days of completions and check-ins, suggestions become personalized. Until then, I use onboarding preferences and light defaults.
        </Text>
      </Card>
    </Card>
  );
}

function ApprovalExpiredState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 14,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
        Approvals
      </Text>

      <Card
        style={{
          borderRadius: 18,
          borderCurve: "continuous",
          padding: 14,
          gap: 10,
          backgroundColor: "rgba(20, 20, 24, 0.88)",
          borderWidth: 1,
          borderColor: "rgba(30, 30, 34, 0.92)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#1a1a1e" }}>
            <FontAwesome name="clock-o" size={14} color="#7a7a86" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              Subscriptions audit · 3 items
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              This proposal sat for 7 days without a response.
            </Text>
          </View>
          <Badge variant="outline" color="secondary">
            Expired
          </Badge>
        </View>
      </Card>

      <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
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
          What happened
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
          Proposals expire after 7 days if not reviewed. Nothing was changed and the AI will only regenerate this if your situation shifts enough to matter again.
        </Text>
      </Card>

      <Button
        title="Regenerate proposal"
        variant="outline"
        onPress={() => onAction("Regenerate proposal", "This preview would create a fresh Finance approval proposal.")}
        style={{ alignSelf: "flex-start", borderRadius: 12, borderCurve: "continuous" }}
      />
    </Card>
  );
}

function WriteErrorState({
  theme,
  onAction,
}: {
  theme: ThemeScale;
  onAction: (title: string, message: string) => void;
}) {
  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        padding: 16,
        gap: 16,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
      }}
    >
      <Text selectable variant="small" style={{ color: theme.mutedForeground, alignSelf: "stretch" }}>
        AI · Approval
      </Text>

      <StateIcon background="rgba(58, 26, 26, 0.28)" borderColor="rgba(226, 75, 74, 0.28)" icon="warning" iconColor="#e24b4a" />

      <View style={{ gap: 8, alignItems: "center" }}>
        <Text selectable style={{ color: "#f0b0b0", fontFamily: "Geist", fontSize: 22, fontWeight: "700" }}>
          Change couldn&apos;t be saved
        </Text>
        <Text selectable variant="small" style={{ color: "#b48383", lineHeight: 20, textAlign: "center" }}>
          The approval succeeded, but the write to Planner failed. Nothing was partially applied.
        </Text>
      </View>

      <Card
        style={{
          width: "100%",
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 14,
          gap: 8,
          backgroundColor: "rgba(58, 26, 26, 0.28)",
          borderWidth: 1,
          borderColor: "rgba(226, 75, 74, 0.28)",
        }}
      >
        <Text selectable variant="small" style={{ color: "#f0b0b0", fontFamily: "Geist", fontWeight: "700" }}>
          What to do
        </Text>
        <Text selectable variant="small" style={{ color: "#b48383", lineHeight: 20 }}>
          Retry approval now. If it fails again, save the proposal back to the inbox and try later from a stable connection.
        </Text>
      </Card>

      <View style={{ width: "100%", gap: 8 }}>
        <Button
          title="Retry approval"
          variant="destructive"
          onPress={() => onAction("Retry approval", "This preview would rerun the write for the approved change.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
        <Button
          title="Save for later"
          variant="outline"
          onPress={() => onAction("Save for later", "This preview would return the proposal to the approval inbox.")}
          style={{ borderRadius: 12, borderCurve: "continuous" }}
        />
      </View>
    </Card>
  );
}

function LoadingStateCard({
  item,
  theme,
  isDarkColorScheme,
}: {
  item: (typeof LOADING_STATES)[number];
  theme: ThemeScale;
  isDarkColorScheme: boolean;
}) {
  const backgroundMap = {
    purple: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
    amber: "rgba(42, 30, 8, 0.24)",
    rose: "rgba(84, 16, 48, 0.18)",
  } as const;
  const borderMap = {
    purple: "rgba(61, 53, 112, 0.28)",
    amber: "rgba(186, 117, 23, 0.24)",
    rose: "rgba(212, 83, 126, 0.24)",
  } as const;

  return (
    <Card
      style={{
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 14,
        gap: 12,
        backgroundColor: backgroundMap[item.tone],
        borderWidth: 1,
        borderColor: borderMap[item.tone],
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <LoadingGlyph id={item.id} accent={item.accent} theme={theme} />
        <View style={{ flex: 1, gap: 4 }}>
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
            {item.label}
          </Text>
          <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
            {item.title}
          </Text>
          <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
            {item.subtitle}
          </Text>
        </View>
      </View>

      {item.actionLabel ? (
        <Button title={item.actionLabel} variant="outline" style={{ alignSelf: "flex-start", borderRadius: 12, borderCurve: "continuous" }} />
      ) : null}
    </Card>
  );
}

function LoadingGlyph({
  id,
  accent,
  theme,
}: {
  id: LoadingStateId;
  accent: string;
  theme: ThemeScale;
}) {
  if (id === "domainLoading") {
    return (
      <View style={{ width: 44, gap: 6, marginTop: 2 }}>
        <View style={{ height: 4, borderRadius: 999, backgroundColor: "rgba(123, 109, 246, 0.18)", overflow: "hidden" }}>
          <View style={{ width: "55%", height: "100%", borderRadius: 999, backgroundColor: accent }} />
        </View>
        <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.border }} />
        <View style={{ width: "70%", height: 8, borderRadius: 999, backgroundColor: theme.border }} />
      </View>
    );
  }

  if (id === "checkinSaving") {
    return (
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(123, 109, 246, 0.12)",
          borderWidth: 1,
          borderColor: "rgba(123, 109, 246, 0.24)",
        }}
      >
        <FontAwesome name="check" size={16} color={accent} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(123, 109, 246, 0.18)",
        borderTopColor: accent,
      }}
    >
      <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: accent }} />
    </View>
  );
}

function Banner({
  tone,
  title,
  subtitle,
  badge,
}: {
  tone: "red" | "amber";
  title: string;
  subtitle: string;
  badge: string;
}) {
  const palette =
    tone === "red"
      ? {
          background: "rgba(58, 26, 26, 0.28)",
          border: "rgba(226, 75, 74, 0.28)",
          dot: "#e24b4a",
          title: "#f0b0b0",
          subtitle: "#c39090",
        }
      : {
          background: "rgba(186, 117, 23, 0.14)",
          border: "rgba(186, 117, 23, 0.24)",
          dot: "#ba7517",
          title: "#e2bf86",
          subtitle: "#b79965",
        };

  return (
    <Card
      style={{
        borderRadius: 14,
        borderCurve: "continuous",
        padding: 12,
        gap: 6,
        backgroundColor: palette.background,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: palette.dot }} />
        <Text selectable variant="small" style={{ color: palette.title, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
          {title}
        </Text>
        <Text selectable variant="muted" style={{ color: palette.subtitle }}>
          {badge}
        </Text>
      </View>
      <Text selectable variant="small" style={{ color: palette.subtitle, lineHeight: 20 }}>
        {subtitle}
      </Text>
    </Card>
  );
}

function StateIcon({
  background,
  borderColor,
  icon,
  iconColor,
}: {
  background: string;
  borderColor: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
}) {
  return (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
        borderWidth: 1,
        borderColor,
      }}
    >
      <FontAwesome name={icon} size={24} color={iconColor} />
    </View>
  );
}

function GhostPlanCard({ theme, label }: { theme: ThemeScale; label: string }) {
  return (
    <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border, opacity: 0.7 }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: theme.border }} />
      <View style={{ width: "70%", height: 10, borderRadius: 999, backgroundColor: theme.border }} />
      <View style={{ width: "85%", height: 10, borderRadius: 999, backgroundColor: theme.border }} />
      <View style={{ width: "55%", height: 10, borderRadius: 999, backgroundColor: theme.border }} />
    </Card>
  );
}

function PriorityRow({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 18, height: 18, borderRadius: 999, borderWidth: 1.5, borderColor: "#555565" }} />
      <Text selectable variant="small" style={{ color: "#b8b8c6", flex: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function PriorityDetail({
  title,
  subtitle,
  color,
  background,
}: {
  title: string;
  subtitle: string;
  color: string;
  background: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <View style={{ width: 18, height: 18, borderRadius: 999, borderWidth: 1.5, borderColor: "#555565", marginTop: 2 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text selectable variant="small" style={{ color: "#d8d8e4", fontFamily: "Geist", fontWeight: "700" }}>
          {title}
        </Text>
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderCurve: "continuous",
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: background,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <Text selectable variant="muted" style={{ color }}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}
