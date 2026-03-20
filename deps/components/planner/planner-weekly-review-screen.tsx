import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PhaseId = 1 | 2 | 3 | 4 | 5;

type Proposal = {
  id: string;
  domain: string;
  domainColor: string;
  domainBackground: string;
  type: string;
  title: string;
  why: string;
  changes: Array<{ key: string; value: string; color?: string }>;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
};

const DOMAIN_HEALTH = [
  { id: "career", label: "Career", value: 90, color: "#85b7eb", fill: "#185FA5" },
  { id: "faith", label: "Faith", value: 85, color: "#b4adf5", fill: "#534AB7" },
  { id: "tasks", label: "Tasks", value: 72, color: "#aaaaaa", fill: "#5F5E5A" },
  { id: "health", label: "Health", value: 70, color: "#f0997b", fill: "#993C1D" },
  { id: "wellness", label: "Wellness", value: 60, color: "#ed93b1", fill: "#993556" },
  { id: "finance", label: "Finance", value: 55, color: "#ba7517", fill: "#ba7517" },
] as const;

const REFLECTION_OPTIONS = {
  worked: ["Morning faith routine", "Deep work blocks", "Evening walks", "Energy management", "Task batching"],
  blocked: ["Finance review kept slipping", "Low energy mid-week", "Unexpected interruptions", "Overloaded Monday"],
};

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: "finance-review",
    domain: "Finance",
    domainColor: "#1d9e75",
    domainBackground: "#1a2a1e",
    type: "Fix backlog",
    title: "Schedule budget review · Monday 10 AM, 45 min",
    why: "Deferred 4 days this week. Slotting it first on Monday before anything else can push it again.",
    changes: [
      { key: "Added to planner", value: "Mon Mar 17 · 10:00 AM" },
      { key: "Priority level", value: "High · first item", color: "#b4adf5" },
    ],
    icon: "money",
  },
  {
    id: "health-recovery",
    domain: "Health",
    domainColor: "#d85a30",
    domainBackground: "#2a1510",
    type: "Protect recovery",
    title: "Keep training at 3x next week, not 4",
    why: "Energy heading into next week is 7. Three sessions with good sleep beats 4 with depleted energy.",
    changes: [
      { key: "Next week target", value: "3 sessions" },
      { key: "Resets week after", value: "Mar 24 → back to 4x", color: "#b4adf5" },
    ],
    icon: "heartbeat",
  },
  {
    id: "faith-fasting",
    domain: "Faith",
    domainColor: "#9b8fff",
    domainBackground: "#2a2040",
    type: "Lock pattern",
    title: "Formalize fasting intention for the next 4 Wednesdays",
    why: "Three consecutive Wednesdays held. Making the rhythm explicit protects it when the week gets busy.",
    changes: [
      { key: "Added to planner", value: "Wed × 4 weeks" },
      { key: "Reminder", value: "Tue 9 PM · prepare", color: "#b4adf5" },
    ],
    icon: "bullseye",
  },
];

const PREVIEW_DAYS: Array<{
  id: string;
  letter: string;
  count: number;
  today?: boolean;
}> = [
  { id: "mon", letter: "M", count: 4, today: true },
  { id: "tue", letter: "T", count: 3 },
  { id: "wed", letter: "W", count: 4 },
  { id: "thu", letter: "T", count: 3 },
  { id: "fri", letter: "F", count: 2 },
];

export function PlannerWeeklyReviewScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [phase, setPhase] = useState<PhaseId>(1);
  const [workedSelections, setWorkedSelections] = useState<string[]>(["Morning faith routine", "Deep work blocks"]);
  const [workedNote, setWorkedNote] = useState("");
  const [blockedSelections, setBlockedSelections] = useState<string[]>(["Finance review kept slipping"]);
  const [blockedNote, setBlockedNote] = useState("");
  const [energy, setEnergy] = useState(7);
  const [readiness, setReadiness] = useState(8);
  const [stress, setStress] = useState(3);
  const [proposalState, setProposalState] = useState<Record<string, "pending" | "approved" | "skipped">>({
    "finance-review": "pending",
    "health-recovery": "pending",
    "faith-fasting": "pending",
  });

  const approvedCount = useMemo(
    () => Object.values(proposalState).filter((value) => value === "approved").length,
    [proposalState],
  );
  const skippedCount = useMemo(
    () => Object.values(proposalState).filter((value) => value === "skipped").length,
    [proposalState],
  );
  const appliedChanges = useMemo(
    () =>
      INITIAL_PROPOSALS.filter((proposal) => proposalState[proposal.id] === "approved").flatMap((proposal) =>
        proposal.changes.map((change) => ({
          id: `${proposal.id}-${change.key}`,
          label: `${proposal.domain}: ${change.value}`,
          color: proposal.domainColor,
        })),
      ),
    [proposalState],
  );

  function toggleSelection(value: string, current: string[], setCurrent: (value: string[] | ((current: string[]) => string[])) => void) {
    setCurrent((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]));
  }

  function markProposal(id: string, state: "approved" | "skipped") {
    setProposalState((current) => ({ ...current, [id]: state }));
  }

  function nextPhase() {
    if (phase < 5) {
      setPhase((current) => (current + 1) as PhaseId);
    }
  }

  function previousPhase() {
    if (phase > 1) {
      setPhase((current) => (current - 1) as PhaseId);
    }
  }

  function skipPhase() {
    if (phase === 4) {
      setPhase(5);
      return;
    }
    nextPhase();
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 28,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              Weekly review · Mar 10 - 14, 2026
            </Text>
            <Badge variant="outline" color="secondary">{`Phase ${phase} of 5`}</Badge>
          </View>
          <View style={{ height: 4, borderRadius: 999, backgroundColor: theme.border, overflow: "hidden" }}>
            <View style={{ width: `${phase * 20}%`, height: "100%", borderRadius: 999, backgroundColor: theme.primary }} />
          </View>
        </Animated.View>

        {phase === 1 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 14 }}>
            <View style={{ gap: 4 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Here&apos;s your week.
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                I&apos;ve read everything. Here&apos;s what I found before I ask you anything.
              </Text>
            </View>

            <Card
              style={{
                borderRadius: 18,
                borderCurve: "continuous",
                padding: 16,
                gap: 12,
                borderWidth: 1,
                borderColor: "rgba(61, 53, 112, 0.32)",
                backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
                <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                  AI read
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginLeft: "auto" }}>
                  Generated Fri 8:00 PM
                </Text>
              </View>
              <Text selectable style={{ color: theme.foreground, lineHeight: 24, fontFamily: "Figtree", fontSize: 15 }}>
                Faith and Career carried the week. Finance was the one open wound. Everything else held steady.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <ReviewStat value="68%" label="Completion" color="#1d9e75" />
                <ReviewStat value="11" label="Priorities" color="#9b8fff" />
                <ReviewStat value="2" label="Deferred" color="#ba7517" />
                <ReviewStat value="47" label="Habits" color="#b4adf5" />
              </View>
              <View style={{ gap: 6 }}>
                {[
                  { id: "faith-flag", color: "#9b8fff", text: "Faith 85% · best week this month. Prayer 5/7, reading 6/7, fasting held." },
                  { id: "career-flag", color: "#85b7eb", text: "Career 90% · deep work streak 5 days. UI/UX sprint 68% complete." },
                  { id: "finance-flag", color: "#ba7517", text: "Finance 55% · budget review deferred 4 days. Surplus pattern still there." },
                  { id: "health-flag", color: "#f0997b", text: "Health 70% · 2 of 3 sessions done. Energy dipped Wednesday during fasting." },
                  { id: "wellness-flag", color: "#ed93b1", text: "Wellness 60% · mood stable at 7.1. Stress lowest in 30 days." },
                ].map((item) => (
                  <View key={item.id} style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: item.color, marginTop: 7 }} />
                    <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 19 }}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={{ gap: 8 }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Domain health
              </Text>
              <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
                {DOMAIN_HEALTH.map((item) => (
                  <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text selectable variant="muted" style={{ color: item.color, width: 64, fontFamily: "Geist", fontWeight: "700" }}>
                      {item.label}
                    </Text>
                    <View style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: isDarkColorScheme ? "#1a1a1e" : "#ececf2", overflow: "hidden" }}>
                      <View style={{ width: `${item.value}%`, height: "100%", borderRadius: 999, backgroundColor: item.fill }} />
                    </View>
                    <Text selectable variant="small" style={{ color: item.color, width: 36, textAlign: "right", fontFamily: "Geist", fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                      {item.value}%
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          </Animated.View>
        ) : null}

        {phase === 2 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 14 }}>
            <View style={{ gap: 4 }}>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Phase 2 · Reflection
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Your turn.
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Three questions. Honest answers only. This shapes your next week.
              </Text>
            </View>

            <ReflectionCard
              index="1 of 3"
              question="What actually worked this week?"
              options={REFLECTION_OPTIONS.worked}
              selections={workedSelections}
              onToggle={(value) => toggleSelection(value, workedSelections, setWorkedSelections)}
              note={workedNote}
              onChangeNote={setWorkedNote}
              notePlaceholder="What felt good this week?"
              theme={theme}
            />
            <ReflectionCard
              index="2 of 3"
              question="What got in the way?"
              options={REFLECTION_OPTIONS.blocked}
              selections={blockedSelections}
              onToggle={(value) => toggleSelection(value, blockedSelections, setBlockedSelections)}
              note={blockedNote}
              onChangeNote={setBlockedNote}
              notePlaceholder="What blocked you or slowed you down?"
              theme={theme}
            />

            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Question 3 of 3
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 22 }}>
                How are you heading into next week?
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <MiniScaleCard label="Energy" value={energy} color="#ba7517" onDecrease={() => setEnergy((value) => Math.max(1, value - 1))} onIncrease={() => setEnergy((value) => Math.min(10, value + 1))} theme={theme} />
                <MiniScaleCard label="Readiness" value={readiness} color="#1d9e75" onDecrease={() => setReadiness((value) => Math.max(1, value - 1))} onIncrease={() => setReadiness((value) => Math.min(10, value + 1))} theme={theme} />
                <MiniScaleCard label="Stress" value={stress} color="#e24b4a" onDecrease={() => setStress((value) => Math.max(1, value - 1))} onIncrease={() => setStress((value) => Math.min(10, value + 1))} theme={theme} />
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {phase === 3 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 14 }}>
            <View style={{ gap: 4 }}>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Phase 3 · AI proposals
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Here&apos;s what I&apos;d change.
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Based on your week and your reflection. Approve what fits and skip what doesn&apos;t.
              </Text>
            </View>

            <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center" }}>
              3 proposals · {approvedCount} approved · {skippedCount} skipped
            </Text>

            {INITIAL_PROPOSALS.map((proposal, index) => {
              const state = proposalState[proposal.id];
              const done = state !== "pending";
              return (
                <Animated.View key={proposal.id} entering={FadeInDown.delay(70 + index * 30).duration(420)}>
                  <Card
                    style={{
                      borderRadius: 18,
                      borderCurve: "continuous",
                      padding: 16,
                      gap: 10,
                      borderWidth: 1,
                      borderColor: done ? theme.border : "rgba(61, 53, 112, 0.28)",
                      backgroundColor: done ? theme.card : (isDarkColorScheme ? "rgba(26, 26, 36, 0.98)" : "rgba(245, 242, 255, 0.98)"),
                      opacity: done ? 0.48 : 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: proposal.domainBackground }}>
                        <FontAwesome name={proposal.icon} size={13} color={proposal.domainColor} />
                      </View>
                      <Text selectable variant="small" style={{ color: proposal.domainColor, fontFamily: "Geist", fontWeight: "700" }}>
                        {proposal.domain}
                      </Text>
                      <Badge variant="outline" color="secondary">{proposal.type}</Badge>
                      <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginLeft: "auto" }}>
                        {index + 1} of 3
                      </Text>
                    </View>
                    <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 20 }}>
                      {proposal.title}
                    </Text>
                    <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                      {proposal.why}
                    </Text>
                    <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, gap: 6, borderWidth: 1, borderColor: theme.border, backgroundColor: isDarkColorScheme ? "#141418" : "#f8f8fb" }}>
                      {proposal.changes.map((change) => (
                        <View key={change.key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <Text selectable variant="muted" style={{ color: theme.mutedForeground, flex: 1 }}>
                            {change.key}
                          </Text>
                          <Text selectable variant="small" style={{ color: change.color ?? "#b4adf5", fontFamily: "Geist", fontWeight: "700" }}>
                            {change.value}
                          </Text>
                        </View>
                      ))}
                    </Card>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button title={state === "approved" ? "Approved" : "Approve"} onPress={() => markProposal(proposal.id, "approved")} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                      <Button title={state === "skipped" ? "Skipped" : "Skip"} variant="outline" onPress={() => markProposal(proposal.id, "skipped")} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </Animated.View>
        ) : null}

        {phase === 4 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 14 }}>
            <View style={{ gap: 4 }}>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Phase 4 · Next week
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Next week, built.
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Draft plan with your approved changes applied. Review and adjust before saving.
              </Text>
            </View>

            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 12, borderWidth: 1, borderColor: theme.border }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                  Week of Mar 17 - 21
                </Text>
                <Badge color="primary">Draft</Badge>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {PREVIEW_DAYS.map((day) => (
                  <View
                    key={day.id}
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      paddingVertical: 8,
                      alignItems: "center",
                      backgroundColor: day.today ? "rgba(123, 109, 246, 0.18)" : theme.card,
                      borderWidth: 1,
                      borderColor: day.today ? "rgba(123, 109, 246, 0.32)" : theme.border,
                    }}
                  >
                    <Text selectable variant="muted" style={{ color: day.today ? "#9b8fff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                      {day.letter}
                    </Text>
                    <Text selectable variant="small" style={{ color: day.today ? "#d7d1ff" : theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                      {day.count}
                    </Text>
                    <View style={{ width: 4, height: 4, borderRadius: 999, marginTop: 4, backgroundColor: day.today ? "#9b8fff" : "#44444f" }} />
                  </View>
                ))}
              </View>
            </Card>

            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Changes applied from proposals
              </Text>
              {(appliedChanges.length ? appliedChanges : [
                { id: "default-finance", label: "Budget review → Monday 10 AM · high priority", color: "#1d9e75" },
                { id: "default-health", label: "Health: 3 sessions target · resets Mar 24", color: "#d85a30" },
              ]).map((item) => (
                <View key={item.id} style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: item.color, marginTop: 7 }} />
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 19 }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </Card>

            <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.32)", backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)", flexDirection: "row", gap: 8 }}>
              <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 6 }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 19 }}>
                16 priorities across 5 days. Monday is your heaviest day intentionally. Finance first, then deep work. Friday stays light as usual.
              </Text>
            </Card>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Adjust plan" onPress={() => router.push("/(tabs)/ai/classic" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              <Button title="View in Planner" variant="outline" onPress={() => router.push("/(tabs)/planner" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            </View>
          </Animated.View>
        ) : null}

        {phase === 5 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 14, paddingTop: 24 }}>
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                padding: 18,
                gap: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(61, 53, 112, 0.32)",
                backgroundColor: isDarkColorScheme ? "rgba(26, 26, 36, 0.98)" : "rgba(245, 242, 255, 0.98)",
              }}
            >
              <View style={{ width: 54, height: 54, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(123, 109, 246, 0.14)", borderWidth: 1.5, borderColor: "#9b8fff" }}>
                <FontAwesome name="check" size={22} color="#9b8fff" />
              </View>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700" }}>
                  Week reviewed.
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center", lineHeight: 20 }}>
                  Plan saved. {approvedCount} changes applied. Next week starts Monday with the budget review first on the list.
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <ReviewStat value={String(approvedCount)} label="Approved" color="#1d9e75" />
                <ReviewStat value="16" label="Priorities" color="#9b8fff" />
                <ReviewStat value="68%" label="This week" color="#b4adf5" />
              </View>
            </Card>

            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 8, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                One thing to carry forward
              </Text>
              <Text selectable style={{ color: "#c8c0d0", lineHeight: 24, fontStyle: "italic" }}>
                The morning faith routine is your strongest anchor right now. Everything else in the week performs better when it holds.
              </Text>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                AI · based on cross-domain patterns
              </Text>
            </Card>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Go to Today" onPress={() => router.push("/(tabs)" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              <Button title="View Planner" variant="outline" onPress={() => router.push("/(tabs)/planner" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            </View>
          </Animated.View>
        ) : null}

        {phase < 5 ? (
          <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ flexDirection: "row", gap: 8 }}>
            <Button title={phase === 4 ? "Save & finish" : "Skip"} variant="outline" onPress={skipPhase} style={{ borderRadius: 12, borderCurve: "continuous" }} />
            <Button
              title={phase === 1 ? "That’s my week" : phase === 2 ? "Done reflecting" : phase === 3 ? "See next week" : "Save plan"}
              onPress={phase === 4 ? () => setPhase(5) : nextPhase}
              style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }}
            />
            {phase > 1 ? <Button title="Back" variant="ghost" onPress={previousPhase} style={{ borderRadius: 12, borderCurve: "continuous" }} /> : null}
          </Animated.View>
        ) : null}
      </ScrollView>
    </Container>
  );
}

function ReviewStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", padding: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.18)" }}>
      <Text selectable style={{ color, fontFamily: "Geist", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ textAlign: "center" }}>
        {label}
      </Text>
    </Card>
  );
}

function ReflectionCard({
  index,
  question,
  options,
  selections,
  onToggle,
  note,
  onChangeNote,
  notePlaceholder,
  theme,
}: {
  index: string;
  question: string;
  options: string[];
  selections: string[];
  onToggle: (value: string) => void;
  note: string;
  onChangeNote: (value: string) => void;
  notePlaceholder: string;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
        Question {index}
      </Text>
      <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 22 }}>
        {question}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const active = selections.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(option)}
              style={({ pressed }) => ({
                borderRadius: 999,
                borderCurve: "continuous",
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                borderWidth: 1,
                borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        or add your own
      </Text>
      <TextInput
        value={note}
        onChangeText={onChangeNote}
        multiline
        numberOfLines={3}
        placeholder={notePlaceholder}
        placeholderTextColor={theme.mutedForeground}
        style={{
          minHeight: 84,
          borderRadius: 12,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.card,
          color: theme.foreground,
          fontFamily: "Figtree",
          paddingHorizontal: 12,
          paddingVertical: 12,
          textAlignVertical: "top",
        }}
      />
    </Card>
  );
}

function MiniScaleCard({
  label,
  value,
  color,
  onDecrease,
  onIncrease,
  theme,
}: {
  label: string;
  value: number;
  color: string;
  onDecrease: () => void;
  onIncrease: () => void;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <Card style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", padding: 12, gap: 8, borderWidth: 1, borderColor: theme.border }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text selectable style={{ color, fontFamily: "Geist", fontSize: 20, fontWeight: "700", textAlign: "center", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <View style={{ height: 5, borderRadius: 999, backgroundColor: theme.border, overflow: "hidden" }}>
        <View style={{ width: `${value * 10}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Pressable onPress={onDecrease} style={({ pressed }) => ({ flex: 1, borderRadius: 999, paddingVertical: 6, alignItems: "center", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, opacity: pressed ? 0.84 : 1 })}>
          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
            -
          </Text>
        </Pressable>
        <Pressable onPress={onIncrease} style={({ pressed }) => ({ flex: 1, borderRadius: 999, paddingVertical: 6, alignItems: "center", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, opacity: pressed ? 0.84 : 1 })}>
          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
            +
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
