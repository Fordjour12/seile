import { useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type RelationshipsView = "people" | "intentions" | "rhythm";

type PersonItem = {
  id: string;
  initials: string;
  avatarBackground: string;
  avatarColor: string;
  name: string;
  relation: string;
  lastText: string;
  lastTime: string;
  warmth: number;
  status: string;
  statusTone: "healthy" | "due" | "overdue";
  logType: string;
  logText: string;
  logTime: string;
  note: string;
  primaryAction: string;
  secondaryAction?: string;
  tertiaryAction?: string;
};

type IntentionItem = {
  id: string;
  title: string;
  meta: string;
  when: string;
  tone: "done" | "today" | "overdue";
  done?: boolean;
};

const PEOPLE: PersonItem[] = [
  {
    id: "dad",
    initials: "DA",
    avatarBackground: "#1a1408",
    avatarColor: "#ba7517",
    name: "Dad",
    relation: "Family · Close",
    lastText: "Last: called, caught up",
    lastTime: "3 weeks ago",
    warmth: 3,
    status: "Overdue · 1 wk",
    statusTone: "overdue",
    logType: "Call",
    logText: "Caught up on work, family news. He asked about the Life OS project.",
    logTime: "Mar 3",
    note: "Preferred contact: Sunday mornings or evenings. Appreciates calls over messages.",
    primaryAction: "Log call",
    secondaryAction: "Schedule",
    tertiaryAction: "History",
  },
  {
    id: "mentor",
    initials: "KA",
    avatarBackground: "#0e1a26",
    avatarColor: "#378add",
    name: "Kwame A.",
    relation: "Mentor · Professional",
    lastText: "Last: shared Life OS update",
    lastTime: "2 weeks ago",
    warmth: 4,
    status: "Overdue · 2d",
    statusTone: "overdue",
    logType: "Message",
    logText: "Shared the UI/UX blueprint draft. He responded positively and asked about the AI layer.",
    logTime: "Mar 1",
    note: "Monthly check-in target. He values real progress updates over vague status messages.",
    primaryAction: "Draft update",
    secondaryAction: "Log touchpoint",
    tertiaryAction: "History",
  },
  {
    id: "sister",
    initials: "AB",
    avatarBackground: "#2a1020",
    avatarColor: "#ed93b1",
    name: "Abena B.",
    relation: "Sister · Family",
    lastText: "Last: birthday call, long catch-up",
    lastTime: "1 week ago",
    warmth: 5,
    status: "Due in 1 week",
    statusTone: "due",
    logType: "Call",
    logText: "Birthday call. Long catch-up on her new job, my Life OS project. Great conversation.",
    logTime: "Mar 7",
    note: "Healthy natural bi-weekly rhythm. No immediate intervention needed.",
    primaryAction: "Log touchpoint",
    secondaryAction: "History",
  },
  {
    id: "efe",
    initials: "EO",
    avatarBackground: "#1a2a1e",
    avatarColor: "#6fcf97",
    name: "Efe O.",
    relation: "Friend · Close",
    lastText: "Last: met up, prayer together",
    lastTime: "5 days ago",
    warmth: 4,
    status: "Healthy ✓",
    statusTone: "healthy",
    logType: "In person",
    logText: "Meetup and prayer session. Encouraged each other on faith goals. Discussed Life OS concept.",
    logTime: "Mar 9",
    note: "Most consistent connection right now. Faith overlap makes this relationship easy to sustain.",
    primaryAction: "Log touchpoint",
    secondaryAction: "History",
  },
];

const INTENTIONS: IntentionItem[] = [
  { id: "dad-call", title: "Call Dad - Sunday morning catch-up", meta: "Family · 20-30 min", when: "Overdue", tone: "overdue" },
  { id: "kwame-update", title: "Send Kwame a Life OS screen update", meta: "Mentor · message · show progress", when: "Today", tone: "today" },
  { id: "efe-prayer", title: "Pray with Efe - meetup", meta: "Friend · in person", when: "Done · Mar 9", tone: "done", done: true },
];

export function RelationshipsDomainScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [view, setView] = useState<RelationshipsView>("people");
  const [openPersonId, setOpenPersonId] = useState<string>("");
  const [doneIntentionIds, setDoneIntentionIds] = useState<string[]>(
    INTENTIONS.filter((item) => item.done).map((item) => item.id),
  );

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function toggleIntention(id: string) {
    setDoneIntentionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 40,
          gap: 14,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#185FA5" }} />
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Relationships
              </Text>
            </View>
            <Pressable
              onPress={() => openStub("Add person", "Adding a new person or touchpoint is not live yet.")}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0e1420",
                borderWidth: 1,
                borderColor: "#1a3040",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <FontAwesome name="plus" size={14} color="#85b7eb" />
            </Pressable>
          </View>
          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
            Mar 10 - 16 · 0 touchpoints this week
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(420)}>
          <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
              <View>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginBottom: 3 }}>
                  Domain health this week
                </Text>
                <Text selectable style={{ color: "#85b7eb", fontFamily: "Geist", fontSize: 34, fontWeight: "700" }}>
                  0%
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginBottom: 3 }}>
                  Status
                </Text>
                <Text selectable variant="small" style={{ color: "#ba7517", fontFamily: "Geist", fontWeight: "700" }}>
                  No activity
                </Text>
              </View>
            </View>
            <View style={{ height: 5, borderRadius: 999, backgroundColor: "#1e1e22", overflow: "hidden", marginBottom: 12 }}>
              <View style={{ width: "0%", height: "100%", borderRadius: 999, backgroundColor: "#185FA5" }} />
            </View>
            <View style={{ flexDirection: "row" }}>
              <MetricCell value="0" label="Touchpoints" color="#ba7517" />
              <MetricCell value="4" label="People tracked" />
              <MetricCell value="2" label="Overdue" color="#e24b4a" />
              <MetricCell value="1" label="Due soon" color="#ba7517" last />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(420)}>
          <View style={{ flexDirection: "row", borderRadius: 10, borderCurve: "continuous", padding: 3, backgroundColor: "#141418", borderWidth: 1, borderColor: theme.border }}>
            {([
              ["people", "People"],
              ["intentions", "Intentions"],
              ["rhythm", "Rhythm"],
            ] as Array<[RelationshipsView, string]>).map(([key, label]) => {
              const active = view === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setView(key)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 7,
                    borderCurve: "continuous",
                    paddingVertical: 8,
                    alignItems: "center",
                    backgroundColor: active ? "#0e1420" : "transparent",
                    borderWidth: active ? 1 : 0,
                    borderColor: active ? "#1a3040" : "transparent",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#85b7eb" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {view === "people" ? (
          <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 10 }}>
            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
              Needs attention · 2
            </Text>
            {PEOPLE.slice(0, 2).map((person) => (
              <PersonCard key={person.id} person={person} open={openPersonId === person.id} onToggle={() => setOpenPersonId((current) => (current === person.id ? "" : person.id))} />
            ))}

            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginTop: 4 }}>
              Active · 2
            </Text>
            {PEOPLE.slice(2).map((person) => (
              <PersonCard key={person.id} person={person} open={openPersonId === person.id} onToggle={() => setOpenPersonId((current) => (current === person.id ? "" : person.id))} />
            ))}

            <Pressable
              onPress={() => openStub("Add person", "Adding a tracked person is not wired yet.")}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderCurve: "continuous",
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: "#141418",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: 999, borderWidth: 1, borderStyle: "dashed", borderColor: theme.border, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="plus" size={14} color={theme.mutedForeground} />
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Add a person to track
              </Text>
            </Pressable>

            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#8888a0", lineHeight: 20, marginBottom: 8 }}>
                  Relationships had zero activity this week. Dad is 3 weeks since last contact. Kwame is 2 weeks. One message to either of them today closes the gap before the weekend.
                </Text>
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  <MiniAction label="Message Dad" onPress={() => openStub("Message Dad", "Drafting a Dad message is not wired yet.")} />
                  <MiniAction label="Update Kwame" onPress={() => openStub("Update Kwame", "Drafting a mentor update is not wired yet.")} />
                  <MiniAction label="30-day view" onPress={() => setView("rhythm")} />
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {view === "intentions" ? (
          <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                This week
              </Text>
              <Pressable onPress={() => openStub("Add intention", "Creating a relationship intention is not live yet.")}>
                <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                  + Add
                </Text>
              </Pressable>
            </View>
            {INTENTIONS.map((item) => {
              const done = doneIntentionIds.includes(item.id);
              return (
                <Card key={item.id} style={{ borderRadius: 14, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pressable
                      onPress={() => toggleIntention(item.id)}
                      style={({ pressed }) => ({
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: done ? "#185FA5" : theme.border,
                        backgroundColor: done ? "#185FA5" : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.84 : 1,
                      })}
                    >
                      {done ? <FontAwesome name="check" size={9} color="#ffffff" /> : null}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                        {item.title}
                      </Text>
                      <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 2 }}>
                        {item.meta}
                      </Text>
                    </View>
                    <Text selectable variant="small" style={{ color: item.tone === "overdue" ? "#e24b4a" : item.tone === "today" ? "#ba7517" : "#1d9e75", fontFamily: "Geist", fontWeight: "700" }}>
                      {item.when}
                    </Text>
                  </View>
                </Card>
              );
            })}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                Next week
              </Text>
              <Pressable onPress={() => openStub("Plan next week", "Generating next-week relationship intentions is not wired yet.")}>
                <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                  Plan
                </Text>
              </Pressable>
            </View>
            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, alignItems: "center", borderWidth: 1, borderColor: theme.border, backgroundColor: "#141418" }}>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, marginBottom: 6 }}>
                No intentions set yet
              </Text>
              <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                Ask AI to suggest intentions
              </Text>
            </Card>
            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#8888a0", lineHeight: 20, marginBottom: 8 }}>
                  Setting one intention per week per person is the lowest-friction way to keep relationships warm. Two calls, one message, one prayer meetup - that is a full week.
                </Text>
                <MiniAction label="Generate for next week" onPress={() => openStub("Generate intentions", "Next-week AI relationship planning is not wired yet.")} />
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {view === "rhythm" ? (
          <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 10 }}>
            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
              Contact rhythm · last 4 weeks
            </Text>
            <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                  Person
                </Text>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {["W1", "W2", "W3", "Now"].map((label, index) => (
                    <Text key={label} selectable variant="muted" style={{ width: 36, textAlign: "center", color: index === 3 ? "#9b8fff" : theme.mutedForeground }}>
                      {label}
                    </Text>
                  ))}
                </View>
              </View>
              {[
                ["Dad", "DA", "#1a1408", "#ba7517", [1, 1, 1, 0]],
                ["Kwame A.", "KA", "#0e1a26", "#378add", [0, 1, 1, 0]],
                ["Abena B.", "AB", "#2a1020", "#ed93b1", [1, 0, 1, 1]],
                ["Efe O.", "EO", "#1a2a1e", "#6fcf97", [1, 1, 1, 1]],
              ].map(([name, initials, bg, color, weeks], index) => (
                <View key={name as string} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: theme.border }}>
                  <View style={{ width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: bg as string }}>
                    <Text selectable variant="muted" style={{ color: color as string, fontFamily: "Geist", fontWeight: "700" }}>
                      {initials as string}
                    </Text>
                  </View>
                  <Text selectable variant="small" style={{ color: theme.foreground, flex: 1 }}>
                    {name as string}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {(weeks as number[]).map((active, weekIndex) => (
                      <View key={`${name}-${weekIndex}`} style={{ width: 36, height: 22, borderRadius: 6, backgroundColor: active ? "#1a2a1e" : "#141418", alignItems: "center", justifyContent: "center" }}>
                        {active ? <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: weekIndex === 3 && name !== "Efe O." ? "#5a3a1a" : "#1d9e75" }} /> : null}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </Card>
            <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 8 }}>
              <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
                Efe is your most consistent connection - 4 of 4 weeks touched. Dad and Kwame both have a gap this week. Abena is on a healthy bi-weekly rhythm naturally.
              </Text>
            </Card>
            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#8888a0", lineHeight: 20, marginBottom: 8 }}>
                  Your strongest relationship week was 3 weeks ago - all 4 people had touchpoints. This week broke the streak. The pattern is there; this week is the exception, not the trend.
                </Text>
                <MiniAction label="Restore rhythm" onPress={() => openStub("Restore rhythm", "Generating a recovery rhythm plan is not wired yet.")} />
              </View>
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MetricCell({
  value,
  label,
  color,
  last = false,
}: {
  value: string;
  label: string;
  color?: string;
  last?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", borderRightWidth: last ? 0 : 1, borderRightColor: "#1e1e22" }}>
      <Text selectable style={{ color: color ?? "#e0e0ec", fontFamily: "Geist", fontSize: 16, fontWeight: "700" }}>
        {value}
      </Text>
      <Text selectable variant="muted">
        {label}
      </Text>
    </View>
  );
}

function PersonCard({
  person,
  open,
  onToggle,
}: {
  person: PersonItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: person.statusTone === "overdue" ? "#3d2a10" : "#2a2a2e", backgroundColor: person.statusTone === "overdue" ? "#160f08" : "#1a1a1e", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
      <Pressable onPress={onToggle} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: person.avatarBackground, borderWidth: 1.5, borderColor: person.statusTone === "overdue" ? "#3d2a10" : "#1a3040" }}>
            <Text selectable variant="muted" style={{ color: person.avatarColor, fontFamily: "Geist", fontWeight: "700" }}>
              {person.initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable style={{ color: "#d0d0dc", fontFamily: "Geist", fontWeight: "700", marginBottom: 2 }}>
              {person.name}
            </Text>
            <Text selectable variant="muted" style={{ marginBottom: 5 }}>
              {person.relation}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text selectable variant="small" style={{ color: "#666" }}>
                {person.lastText}
              </Text>
              <Text selectable variant="muted">
                {person.lastTime}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", gap: 2, marginBottom: 4 }}>
              {Array.from({ length: 5 }, (_, index) => (
                <View key={`${person.id}-${index}`} style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: index < person.warmth ? person.avatarColor : "#2a2a2e" }} />
              ))}
            </View>
            <Text selectable variant="muted" style={{ color: person.statusTone === "overdue" ? "#e24b4a" : person.statusTone === "due" ? "#ba7517" : "#1d9e75" }}>
              {person.status}
            </Text>
          </View>
        </View>
      </Pressable>
      {open ? (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#1e1e22", gap: 10 }}>
          <View>
            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginBottom: 6 }}>
              Recent log
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text selectable variant="muted" style={{ width: 60 }}>
                {person.logType}
              </Text>
              <Text selectable variant="small" style={{ color: "#888", flex: 1, lineHeight: 18 }}>
                {person.logText}
              </Text>
              <Text selectable variant="muted">
                {person.logTime}
              </Text>
            </View>
          </View>
          <View>
            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginBottom: 6 }}>
              Notes
            </Text>
            <Text selectable variant="small" style={{ color: "#555", lineHeight: 18 }}>
              {person.note}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Button title={person.primaryAction} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            {person.secondaryAction ? (
              <Button title={person.secondaryAction} variant="outline" style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            ) : null}
            {person.tertiaryAction ? (
              <Button title={person.tertiaryAction} variant="ghost" style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            ) : null}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function MiniAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#1e1a30",
        borderWidth: 1,
        borderColor: "#3d3570",
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text selectable variant="small" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
