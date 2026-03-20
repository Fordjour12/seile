import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type QuickType = "task" | "habit" | "expense" | "prayer" | "note";

const TYPE_OPTIONS: Array<{ id: QuickType; label: string; icon: React.ComponentProps<typeof FontAwesome>["name"]; color: string; background: string }> = [
  { id: "task", label: "Task", icon: "check-square-o", color: "#c8c0ff", background: "rgba(123, 109, 246, 0.12)" },
  { id: "habit", label: "Habit", icon: "repeat", color: "#6fcf97", background: "rgba(31, 169, 127, 0.12)" },
  { id: "expense", label: "Expense", icon: "money", color: "#7cd9aa", background: "rgba(31, 169, 127, 0.14)" },
  { id: "prayer", label: "Prayer", icon: "bullseye", color: "#b8abff", background: "rgba(123, 109, 246, 0.16)" },
  { id: "note", label: "Note", icon: "file-text-o", color: "#d69030", background: "rgba(214, 144, 48, 0.14)" },
] as const;

const DOMAIN_OPTIONS = [
  { label: "Career", color: "#185FA5" },
  { label: "Faith", color: "#534AB7" },
  { label: "Finance", color: "#0F6E56" },
  { label: "Health", color: "#993C1D" },
  { label: "Wellness", color: "#993556" },
  { label: "Tasks", color: "#5F5E5A" },
] as const;

export function QuickAddSheetScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [activeType, setActiveType] = useState<QuickType>("task");
  const [taskText, setTaskText] = useState("");
  const [habitText, setHabitText] = useState("");
  const [expenseText, setExpenseText] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [frequency, setFrequency] = useState("Daily");
  const [selectedDomain, setSelectedDomain] = useState("Career");

  const currentDomain = useMemo(
    () => DOMAIN_OPTIONS.find((item) => item.label === selectedDomain) ?? DOMAIN_OPTIONS[0],
    [selectedDomain],
  );

  const taskSuggestion = taskText.trim()
    ? "Looks like a Career task - slotting for your next deep work block."
    : null;
  const expenseSuggestion = expenseAmount.trim()
    ? `GHc ${Math.max(0, 88 - Number(expenseAmount || 0))} left in your daily budget today.`
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
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
        <Animated.View entering={FadeInDown.duration(420)}>
          <View style={{ alignItems: "center", paddingTop: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: theme.border }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {TYPE_OPTIONS.map((item) => {
              const active = item.id === activeType;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setActiveType(item.id)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: active ? item.background : theme.card,
                    borderWidth: 1,
                    borderColor: active ? item.color : theme.border,
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <FontAwesome name={item.icon} size={13} color={active ? item.color : theme.mutedForeground} />
                  <Text selectable variant="small" style={{ color: active ? theme.foreground : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ gap: 12 }}>
          {activeType === "task" ? (
            <Card style={{ borderRadius: 20, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <TextInput
                value={taskText}
                onChangeText={setTaskText}
                placeholder="What needs to get done?"
                placeholderTextColor={theme.mutedForeground}
                multiline
                style={{
                  minHeight: 88,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontFamily: "Figtree",
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["High", "Medium", "Low"].map((item) => {
                  const active = item === priority;
                  const accent = item === "High" ? "#f0997b" : item === "Medium" ? "#9b8fff" : theme.mutedForeground;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setPriority(item as "High" | "Medium" | "Low")}
                      style={({ pressed }) => ({
                        flex: 1,
                        borderRadius: 12,
                        borderCurve: "continuous",
                        minHeight: 38,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active ? `${accent}18` : theme.card,
                        borderWidth: 1,
                        borderColor: active ? accent : theme.border,
                        opacity: pressed ? 0.84 : 1,
                      })}
                    >
                      <Text selectable variant="small" style={{ color: active ? accent : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <MetaRow currentDomain={currentDomain} theme={theme} />
              {taskSuggestion ? <SuggestionStrip text={taskSuggestion} theme={theme} /> : null}
            </Card>
          ) : null}

          {activeType === "habit" ? (
            <Card style={{ borderRadius: 20, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <TextInput
                value={habitText}
                onChangeText={setHabitText}
                placeholder="Name this habit..."
                placeholderTextColor={theme.mutedForeground}
                style={{
                  minHeight: 52,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  fontFamily: "Figtree",
                  fontSize: 16,
                }}
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {["Daily", "Weekdays", "3x week", "Weekly", "Custom"].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setFrequency(item)}
                    style={({ pressed }) => ({
                      borderRadius: 999,
                      borderCurve: "continuous",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      backgroundColor: frequency === item ? "rgba(31, 169, 127, 0.12)" : theme.card,
                      borderWidth: 1,
                      borderColor: frequency === item ? "rgba(31, 169, 127, 0.24)" : theme.border,
                      opacity: pressed ? 0.84 : 1,
                    })}
                  >
                    <Text selectable variant="small" style={{ color: frequency === item ? "#6fcf97" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <MetaRow currentDomain={{ label: "Faith", color: "#534AB7" }} theme={theme} />
              <SuggestionStrip text="Faith habits added here appear on Today automatically and feed your streak tracking." theme={theme} />
            </Card>
          ) : null}

          {activeType === "expense" ? (
            <Card style={{ borderRadius: 20, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text selectable style={{ color: theme.mutedForeground, fontFamily: "Geist", fontSize: 18, fontWeight: "700" }}>
                  GHc
                </Text>
                <TextInput
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  placeholder="0"
                  placeholderTextColor={theme.mutedForeground}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    minHeight: 52,
                    borderRadius: 14,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                    color: "#1d9e75",
                    paddingHorizontal: 16,
                    fontFamily: "Geist",
                    fontSize: 24,
                    fontWeight: "700",
                  }}
                />
              </View>
              <TextInput
                value={expenseText}
                onChangeText={setExpenseText}
                placeholder="What was this for?"
                placeholderTextColor={theme.mutedForeground}
                style={{
                  minHeight: 52,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  fontFamily: "Figtree",
                  fontSize: 15,
                }}
              />
              <MetaRow currentDomain={{ label: "General", color: "#185FA5" }} theme={theme} />
              {expenseSuggestion ? <SuggestionStrip text={expenseSuggestion} theme={theme} /> : null}
            </Card>
          ) : null}

          {activeType === "prayer" ? (
            <Card style={{ borderRadius: 20, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <TextInput
                value={prayerText}
                onChangeText={setPrayerText}
                placeholder="Log a prayer, intention, or reflection..."
                placeholderTextColor={theme.mutedForeground}
                multiline
                style={{
                  minHeight: 110,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontFamily: "Figtree",
                  fontSize: 15,
                  textAlignVertical: "top",
                }}
              />
              <MetaRow currentDomain={{ label: "Faith", color: "#534AB7" }} theme={theme} />
              <SuggestionStrip text="Prayer logs can be turned into streak-aware practices later from the Faith domain." theme={theme} />
            </Card>
          ) : null}

          {activeType === "note" ? (
            <Card style={{ borderRadius: 20, borderCurve: "continuous", padding: 16, gap: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Capture a thought, insight, or loose note..."
                placeholderTextColor={theme.mutedForeground}
                multiline
                style={{
                  minHeight: 120,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontFamily: "Figtree",
                  fontSize: 15,
                  textAlignVertical: "top",
                }}
              />
              <MetaRow currentDomain={{ label: "Tasks", color: "#5F5E5A" }} theme={theme} />
            </Card>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Cancel" variant="outline" style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
          <Button title="Save" style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MetaRow({
  currentDomain,
  theme,
}: {
  currentDomain: { label: string; color: string };
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <MetaChip label={currentDomain.label} iconColor={currentDomain.color} theme={theme} />
      <MetaChip label="Today" icon="clock-o" theme={theme} />
      <MetaChip label="Deep work" icon="bars" theme={theme} />
    </View>
  );
}

function MetaChip({
  label,
  icon = "circle",
  iconColor,
  theme,
}: {
  label: string;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor?: string;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View
      style={{
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <FontAwesome name={icon} size={11} color={iconColor ?? theme.mutedForeground} />
      <Text selectable variant="small" style={{ color: theme.foreground }}>
        {label}
      </Text>
    </View>
  );
}

function SuggestionStrip({
  text,
  theme,
}: {
  text: string;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderCurve: "continuous",
        padding: 12,
        backgroundColor: "rgba(123, 109, 246, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(123, 109, 246, 0.18)",
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
      <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
}
