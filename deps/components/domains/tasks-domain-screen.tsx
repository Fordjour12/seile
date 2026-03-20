import { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type TaskView = "all" | "today" | "upcoming" | "done";
type TaskBucket = "overdue" | "today" | "deferred" | "done";

type TaskItem = {
  id: string;
  title: string;
  bucket: TaskBucket;
  dueLabel: string;
  dueTone: string;
  priorityColor: string;
  badgeLabel: string;
  badgeText: string;
  badgeBackground: string;
  notes?: string;
  plannedBanner?: string;
  actions?: Array<{ id: string; label: string; route?: string; message?: string; destructive?: boolean }>;
};

type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const VIEW_OPTIONS: Array<{ id: TaskView; label: string }> = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "done", label: "Done" },
];

const TASKS: TaskItem[] = [
  {
    id: "budget-review",
    title: "Q2 budget variance review",
    bucket: "overdue",
    dueLabel: "Was due Mon Mar 10",
    dueTone: "#e16969",
    priorityColor: "#e16969",
    badgeLabel: "Overdue",
    badgeText: "#d17474",
    badgeBackground: "rgba(225, 105, 105, 0.14)",
    notes: "Deferred 4 days. Linked to Finance domain health dropping to 55%. GHc 1,240 is still unreviewed.",
    actions: [
      { id: "do-now", label: "Do it now", route: "/(tabs)/domains/finance" },
      { id: "move", label: "Move to next week", message: "This move is not wired yet, but the rescheduling pattern is now in place." },
      { id: "delete", label: "Delete", destructive: true, message: "Delete flow for this task card is not wired yet." },
    ],
  },
  {
    id: "domains-hub-design",
    title: "Life OS - Domains hub screen design",
    bucket: "today",
    dueLabel: "Today · Deep work",
    dueTone: "#a896ff",
    priorityColor: "#a896ff",
    badgeLabel: "Career",
    badgeText: "#91bfff",
    badgeBackground: "rgba(47, 125, 209, 0.14)",
    notes: "Part of the UI/UX sprint. Design system continuity matters more than raw speed here.",
    actions: [
      { id: "details", label: "Details", message: "This task detail sheet is not built yet." },
      { id: "move", label: "Move to Sat", message: "Task rescheduling will be wired after the UI pass." },
    ],
  },
  {
    id: "reply-messages",
    title: "Reply to 3 pending messages",
    bucket: "today",
    dueLabel: "Today · Afternoon",
    dueTone: "#a896ff",
    priorityColor: "#787d87",
    badgeLabel: "Tasks",
    badgeText: "#a2a7b1",
    badgeBackground: "rgba(120, 125, 135, 0.14)",
    notes: "Deferred from Monday. Two professional replies and one personal follow-up are waiting.",
    actions: [
      { id: "draft", label: "Draft replies", message: "Message drafting is not connected on this screen yet." },
      { id: "move", label: "Move to Sat", message: "The calendar move action is a placeholder for now." },
    ],
  },
  {
    id: "recurring-schema",
    title: "Convex schema - finalize recurring transactions table",
    bucket: "today",
    dueLabel: "Today · Deep work",
    dueTone: "#a896ff",
    priorityColor: "#a896ff",
    badgeLabel: "Career",
    badgeText: "#91bfff",
    badgeBackground: "rgba(47, 125, 209, 0.14)",
    notes: "Subscriptions-within-recurring-transactions approach. UTC only. Ties directly into Finance cron jobs.",
    actions: [
      { id: "work", label: "Work on this", message: "This action stays UI-only until task execution is connected." },
      { id: "defer", label: "Defer", message: "Planner-backed defer support is not wired from this route yet." },
    ],
  },
  {
    id: "cron-dashboard",
    title: "Set up Convex cron job monitoring dashboard",
    bucket: "deferred",
    dueLabel: "Mon Mar 17",
    dueTone: "#d69030",
    priorityColor: "#d69030",
    badgeLabel: "Deferred",
    badgeText: "#d69030",
    badgeBackground: "rgba(214, 144, 48, 0.14)",
    notes: "24 cron jobs need a monitoring view. Slotted for Monday alongside the week kickoff.",
    plannedBanner: "Slotted for Monday Mar 17 in your Planner draft",
    actions: [
      { id: "move-back", label: "Move to this week", message: "Planner rescheduling from this route is not live yet." },
      { id: "remove", label: "Remove from plan", message: "Plan removal is still a placeholder action." },
    ],
  },
  {
    id: "faith-research",
    title: "Research Faith domain journaling UX patterns",
    bucket: "deferred",
    dueLabel: "Tue Mar 18",
    dueTone: "#d69030",
    priorityColor: "#787d87",
    badgeLabel: "Faith + Career",
    badgeText: "#b8abff",
    badgeBackground: "rgba(123, 109, 246, 0.14)",
    notes: "Reference work for the Faith domain screen. Useful, but not urgent against the current sprint.",
    plannedBanner: "Slotted for Tuesday Mar 18 in your Planner draft",
    actions: [
      { id: "research", label: "Research now", message: "Reference capture tooling is not connected here yet." },
      { id: "delete", label: "Delete", destructive: true, message: "Delete flow is still pending." },
    ],
  },
  {
    id: "schema-finalization",
    title: "Life OS schema finalization",
    bucket: "done",
    dueLabel: "Mon · Completed",
    dueTone: "#6b7280",
    priorityColor: "#7b8794",
    badgeLabel: "Career",
    badgeText: "#91bfff",
    badgeBackground: "rgba(47, 125, 209, 0.14)",
  },
  {
    id: "cron-implementation",
    title: "Convex cron job implementation",
    bucket: "done",
    dueLabel: "Tue · Completed",
    dueTone: "#6b7280",
    priorityColor: "#7b8794",
    badgeLabel: "Career",
    badgeText: "#91bfff",
    badgeBackground: "rgba(47, 125, 209, 0.14)",
  },
  {
    id: "ai-context-design",
    title: "AI layer userContext design",
    bucket: "done",
    dueLabel: "Wed · Completed",
    dueTone: "#6b7280",
    priorityColor: "#7b8794",
    badgeLabel: "Career",
    badgeText: "#91bfff",
    badgeBackground: "rgba(47, 125, 209, 0.14)",
  },
];

export function TasksDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compactStats = width < 390;

  const [view, setView] = useState<TaskView>("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "budget-review": true,
  });
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const sections = useMemo(() => {
    const overdue = TASKS.filter((task) => task.bucket === "overdue" && !completedIds[task.id]);
    const today = TASKS.filter((task) => task.bucket === "today" && !completedIds[task.id]);
    const deferred = TASKS.filter((task) => task.bucket === "deferred" && !completedIds[task.id]);
    const done = TASKS.filter((task) => task.bucket === "done" || completedIds[task.id]);

    return { overdue, today, deferred, done };
  }, [completedIds]);

  function navigateTo(href: string) {
    router.push(href as never);
  }

  function openAction(taskTitle: string, action: { label: string; route?: string; message?: string }) {
    if (action.route) {
      navigateTo(action.route);
      return;
    }

    RNAlert.alert(taskTitle, action.message ?? `${action.label} is not wired yet.`);
  }

  function toggleTaskExpanded(id: string, isDone: boolean) {
    if (isDone) {
      return;
    }

    setExpandedIds((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleTaskComplete(id: string) {
    setCompletedIds((current) => ({ ...current, [id]: !current[id] }));
    setExpandedIds((current) => ({ ...current, [id]: false }));
  }

  const sectionsToRender =
    view === "today"
      ? [{ id: "today", title: "Today", countLabel: `${sections.today.length} tasks`, items: sections.today }]
      : view === "upcoming"
        ? [{ id: "deferred", title: "Deferred to next week", countLabel: `${sections.deferred.length}`, items: sections.deferred }]
        : view === "done"
          ? [{ id: "done", title: "Done this week", countLabel: `${sections.done.length} tasks`, items: sections.done }]
          : [
              { id: "overdue", title: "Overdue", countLabel: `${sections.overdue.length}`, items: sections.overdue, tone: "#e16969" },
              { id: "today", title: "Today", countLabel: `${sections.today.length} tasks`, items: sections.today, actionLabel: "+ Add" },
              { id: "deferred", title: "Deferred to next week", countLabel: `${sections.deferred.length}`, items: sections.deferred, tone: "#d69030" },
              { id: "done", title: "Done this week", countLabel: `${sections.done.length} tasks`, items: sections.done },
            ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -64,
          right: -56,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(123, 109, 246, 0.14)" : "rgba(123, 109, 246, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 240,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(148, 154, 168, 0.08)" : "rgba(148, 154, 168, 0.08)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <Card
            style={{
              borderRadius: 26,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(104, 112, 124, 0.28)" : "rgba(104, 112, 124, 0.16)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Badge variant="subtle" color="default">
                Tasks domain
              </Badge>
              <Button
                title="Add task"
                size="sm"
                onPress={() => navigateTo("/(tabs)/scheduler/tasks/create")}
                style={{
                  minHeight: 34,
                  paddingHorizontal: 14,
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#8a8f9c",
                  }}
                />
                <Text
                  selectable
                  style={{
                    fontFamily: "Geist",
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.foreground,
                  }}
                >
                  Week of Mar 10
                </Text>
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                72% complete · one overdue Finance review is the main drag on the week.
              </Text>
            </View>

            <View
              style={{
                flexDirection: compactStats ? "column" : "row",
                gap: 10,
              }}
            >
              <StatBlock label="Done" value="8" color="#1fa97f" theme={theme} />
              <StatBlock label="In progress" value="3" color="#a896ff" theme={theme} />
              <StatBlock label="Deferred" value="2" color="#d69030" theme={theme} />
              <StatBlock label="Overdue" value="1" color="#e16969" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDarkColorScheme ? "rgba(21, 22, 28, 0.96)" : "rgba(243, 244, 247, 0.96)",
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              padding: 4,
              gap: 4,
            }}
          >
            {VIEW_OPTIONS.map((option) => {
              const selected = option.id === view;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setView(option.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? theme.card : "transparent",
                    borderWidth: selected ? 1 : 0,
                    borderColor: selected ? theme.border : "transparent",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: selected ? theme.foreground : theme.mutedForeground,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {sectionsToRender.map((section, index) => (
          <Animated.View key={section.id} entering={FadeInDown.delay(120 + index * 60).duration(420)} style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text
                  selectable
                  variant="muted"
                  style={{
                    color: section.tone ?? theme.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  {section.title}
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  {section.countLabel}
                </Text>
              </View>

              {section.actionLabel ? (
                <Pressable onPress={() => navigateTo("/(tabs)/scheduler/tasks/create")}>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: theme.primary,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {section.actionLabel}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {section.items.map((task) => {
              const isDone = task.bucket === "done" || completedIds[task.id];
              const isExpanded = !!expandedIds[task.id];
              const isOverdue = task.bucket === "overdue" && !isDone;
              const isDeferred = task.bucket === "deferred" && !isDone;

              return (
                <Pressable
                  key={task.id}
                  onPress={() => toggleTaskExpanded(task.id, isDone)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.96 : isDone ? 0.54 : 1,
                  })}
                >
                  <Card
                    style={{
                      borderRadius: 18,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: isOverdue
                        ? "rgba(225, 105, 105, 0.24)"
                        : isDeferred
                          ? "rgba(214, 144, 48, 0.28)"
                          : theme.border,
                      backgroundColor: isOverdue
                        ? isDarkColorScheme
                          ? "rgba(32, 15, 15, 0.95)"
                          : "rgba(255, 241, 241, 0.95)"
                        : isDeferred
                          ? isDarkColorScheme
                            ? "rgba(30, 23, 11, 0.95)"
                            : "rgba(255, 247, 232, 0.95)"
                          : theme.card,
                      padding: 14,
                      gap: isExpanded ? 12 : 0,
                      boxShadow: theme.shadowSm,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        style={({ pressed }) => ({
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: isDone ? "#7b8794" : theme.border,
                          backgroundColor: isDone ? "#7b8794" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 2,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        {isDone ? <FontAwesome name="check" size={11} color="#ffffff" /> : null}
                      </Pressable>

                      <View style={{ flex: 1, gap: 6 }}>
                        <Text
                          selectable
                          style={{
                            fontFamily: "Geist",
                            fontWeight: "700",
                            color: theme.foreground,
                            textDecorationLine: isDone ? "line-through" : "none",
                          }}
                        >
                          {task.title}
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <View
                            style={{
                              borderRadius: 999,
                              paddingHorizontal: 9,
                              paddingVertical: 4,
                              backgroundColor: task.badgeBackground,
                            }}
                          >
                            <Text
                              selectable
                              variant="muted"
                              style={{
                                color: task.badgeText,
                                fontFamily: "Geist",
                                fontWeight: "700",
                              }}
                            >
                              {task.badgeLabel}
                            </Text>
                          </View>
                          <Text selectable variant="small" style={{ color: task.dueTone }}>
                            {task.dueLabel}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          backgroundColor: task.priorityColor,
                          marginTop: 8,
                        }}
                      />
                    </View>

                    {isExpanded && !isDone ? (
                      <View style={{ paddingLeft: 34, gap: 10 }}>
                        {task.notes ? (
                          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                            {task.notes}
                          </Text>
                        ) : null}

                        {task.plannedBanner ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              padding: 10,
                              borderRadius: 12,
                              borderCurve: "continuous",
                              backgroundColor: isDarkColorScheme ? "rgba(214, 144, 48, 0.08)" : "rgba(255, 243, 224, 0.96)",
                            }}
                          >
                            <FontAwesome name="clock-o" size={13} color="#d69030" />
                            <Text selectable variant="small" style={{ color: "#d69030", flex: 1 }}>
                              {task.plannedBanner}
                            </Text>
                          </View>
                        ) : null}

                        {task.actions?.length ? (
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {task.actions.map((action) => (
                              <Pressable
                                key={action.id}
                                onPress={(event) => {
                                  event.stopPropagation();
                                  openAction(task.title, action);
                                }}
                                style={({ pressed }) => ({
                                  borderRadius: 999,
                                  borderCurve: "continuous",
                                  paddingHorizontal: 12,
                                  paddingVertical: 7,
                                  backgroundColor: action.destructive
                                    ? isDarkColorScheme
                                      ? "rgba(225, 105, 105, 0.12)"
                                      : "rgba(255, 239, 239, 0.96)"
                                    : isDarkColorScheme
                                      ? "rgba(255,255,255,0.04)"
                                      : "rgba(243, 244, 247, 0.96)",
                                  borderWidth: 1,
                                  borderColor: action.destructive
                                    ? "rgba(225, 105, 105, 0.22)"
                                    : theme.border,
                                  opacity: pressed ? 0.84 : 1,
                                })}
                              >
                                <Text
                                  selectable
                                  variant="small"
                                  style={{
                                    color: action.destructive ? "#e16969" : theme.foreground,
                                    fontFamily: "Geist",
                                    fontWeight: "700",
                                  }}
                                >
                                  {action.label}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                </Pressable>
              );
            })}
          </Animated.View>
        ))}

        {view === "all" ? (
          <Animated.View entering={FadeInDown.delay(420).duration(420)} style={{ gap: 14 }}>
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.34)" : "rgba(110, 98, 190, 0.2)",
                backgroundColor: isDarkColorScheme ? "rgba(18, 18, 32, 0.95)" : "rgba(243, 241, 255, 0.98)",
                padding: 16,
                gap: 12,
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "#a896ff",
                    marginTop: 6,
                  }}
                />
                <View style={{ flex: 1, gap: 10 }}>
                  <Text selectable style={{ color: isDarkColorScheme ? "#c8c2ff" : "#5c54c9" }}>
                    You have already closed 8 tasks this week. The overdue Finance review is the main item dragging
                    overall domain health down.
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    <ActionChip label="Do the review now" onPress={() => navigateTo("/(tabs)/domains/finance")} theme={theme} />
                    <ActionChip
                      label="Defer overdue"
                      onPress={() =>
                        RNAlert.alert(
                          "Bulk defer",
                          "Bulk defer is still UI-only on this route. The action styling is ready for the backend hook-up.",
                        )
                      }
                      theme={theme}
                    />
                  </View>
                </View>
              </View>
            </Card>

            <Button
              title="Add a task"
              variant="outline"
              onPress={() => navigateTo("/(tabs)/scheduler/tasks/create")}
              style={{
                borderRadius: 16,
                borderCurve: "continuous",
                minHeight: 50,
              }}
            />
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: string;
  color: string;
  theme: AppTheme;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderCurve: "continuous",
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.04)",
        gap: 4,
      }}
    >
      <Text
        selectable
        style={{
          fontFamily: "Geist",
          fontSize: 22,
          fontWeight: "700",
          color,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

function ActionChip({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: "rgba(110, 98, 190, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(110, 98, 190, 0.22)",
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text
        selectable
        variant="small"
        style={{
          color: theme.primary,
          fontFamily: "Geist",
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
