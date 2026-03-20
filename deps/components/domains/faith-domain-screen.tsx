import { useState, type ReactNode } from "react";
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

type FaithView = "today" | "rhythm";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const QUICK_LOGS = [
  { id: "prayer", emoji: "🙏", label: "Prayer", done: true },
  { id: "reading", emoji: "📖", label: "Bible reading", done: true },
  { id: "devotional", emoji: "✦", label: "Devotional", done: false },
  { id: "gratitude", emoji: "🌿", label: "Gratitude", done: false },
  { id: "fasting", emoji: "◎", label: "Fasting", done: false },
];

const RHYTHM_DAYS = [
  { day: "M", prayer: true, reading: true, fasting: false, gratitude: true, active: true },
  { day: "T", prayer: true, reading: true, fasting: false, gratitude: false, active: true },
  { day: "W", prayer: true, reading: true, fasting: true, gratitude: false, active: true },
  { day: "T", prayer: true, reading: true, fasting: false, gratitude: true, active: true },
  { day: "F", prayer: true, reading: true, fasting: false, gratitude: false, active: true, current: true },
  { day: "S", prayer: false, reading: false, fasting: false, gratitude: false, active: false },
  { day: "S", prayer: false, reading: false, fasting: false, gratitude: false, active: false },
];

export function FaithDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [view, setView] = useState<FaithView>("today");
  const [quickLogs, setQuickLogs] = useState<Record<string, boolean>>({
    prayer: true,
    reading: true,
    devotional: false,
    gratitude: false,
    fasting: false,
  });

  const compactStats = width < 390;

  function navigateTo(href: string) {
    router.push(href as never);
  }

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function toggleQuickLog(id: string) {
    setQuickLogs((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -52,
          right: -60,
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
          top: 260,
          left: -84,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(31, 169, 127, 0.08)" : "rgba(31, 169, 127, 0.08)",
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
              borderColor: isDarkColorScheme ? "rgba(100, 90, 180, 0.3)" : "rgba(100, 90, 180, 0.16)",
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
              <Badge variant="subtle" color="primary">
                Pinned domain
              </Badge>
              <Button
                title="Quick log"
                size="sm"
                onPress={() => openStub("Quick log", "Quick faith capture is next after the UI pass.")}
                style={{
                  minHeight: 34,
                  paddingHorizontal: 14,
                  backgroundColor: isDarkColorScheme ? "rgba(123, 109, 246, 0.16)" : "rgba(123, 109, 246, 0.12)",
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
                    backgroundColor: "#7b6df6",
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
                85% health · strongest faith week this month.
              </Text>
            </View>

            <View
              style={{
                flexDirection: compactStats ? "column" : "row",
                gap: 10,
              }}
            >
              <MetricPill label="Prayer days" value="5" color="#a896ff" theme={theme} />
              <MetricPill label="Bible days" value="6" color="#91bfff" theme={theme} />
              <MetricPill label="Gratitude" value="4" color="#1fa97f" theme={theme} />
              <MetricPill label="Fasts" value="1" color="#c8b8ff" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(420)}>
          <Card
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
              gap: 14,
              boxShadow: theme.shadowSm,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                  Domain health this week
                </Text>
                <Text
                  selectable
                  style={{
                    fontFamily: "Geist",
                    fontSize: 32,
                    fontWeight: "700",
                    color: "#c8b8ff",
                    lineHeight: 34,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  85%
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text selectable variant="muted">
                  vs last week
                </Text>
                <Text selectable variant="small" style={{ color: "#1fa97f", fontFamily: "Geist", fontWeight: "700" }}>
                  +12%
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 6,
                borderRadius: 999,
                backgroundColor: isDarkColorScheme ? "rgba(255,255,255,0.07)" : "rgba(30, 41, 59, 0.08)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "85%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: "#7b6df6",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: compactStats ? "column" : "row",
                gap: 8,
              }}
            >
              <MiniStat label="Prayer days" value="5" color="#a896ff" theme={theme} />
              <MiniStat label="Fasts" value="1" color="#c8b8ff" theme={theme} />
              <MiniStat label="Bible days" value="6" color="#91bfff" theme={theme} />
              <MiniStat label="Gratitude" value="4" color="#1fa97f" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <View
            style={{
              flexDirection: compactStats ? "column" : "row",
              gap: 10,
            }}
          >
            <StreakCard title="Prayer streak" value="5" accent="#a896ff" theme={theme} />
            <StreakCard title="Reading streak" value="6" accent="#91bfff" theme={theme} />
            <StreakCard title="Devotional streak" value="4" accent="#1fa97f" theme={theme} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(170).duration(420)}>
          <SegmentedControl
            options={[
              { id: "today", label: "Today" },
              { id: "rhythm", label: "Rhythm" },
            ]}
            selected={view}
            onChange={(next) => setView(next as FaithView)}
            theme={theme}
          />
        </Animated.View>

        {view === "today" ? (
          <>
            <Animated.View entering={FadeInDown.delay(220).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Log today" />
              <Card
                style={{
                  borderRadius: 20,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isDarkColorScheme ? "rgba(90, 86, 170, 0.3)" : "rgba(90, 86, 170, 0.16)",
                  backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.95)" : "rgba(246, 244, 255, 0.98)",
                  padding: 14,
                  gap: 10,
                  boxShadow: theme.shadowSm,
                }}
              >
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  What have you done today?
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_LOGS.map((item) => {
                    const done = quickLogs[item.id];

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleQuickLog(item.id)}
                        style={({ pressed }) => ({
                          width: width < 390 ? "48%" : "31%",
                          minWidth: 92,
                          borderRadius: 14,
                          borderCurve: "continuous",
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          backgroundColor: done
                            ? isDarkColorScheme
                              ? "rgba(40, 32, 70, 0.96)"
                              : "rgba(236, 233, 255, 0.98)"
                            : isDarkColorScheme
                              ? "rgba(26, 26, 40, 0.96)"
                              : "rgba(250, 250, 255, 0.98)",
                          borderWidth: 1,
                          borderColor: done ? "rgba(123, 109, 246, 0.34)" : theme.border,
                          opacity: pressed ? 0.88 : 1,
                        })}
                      >
                        <Text selectable style={{ fontSize: 16, textAlign: "center", marginBottom: 5 }}>
                          {item.emoji}
                        </Text>
                        <Text selectable variant="small" style={{ textAlign: "center", color: done ? "#c8b8ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                          {item.label}
                        </Text>
                        <Text selectable variant="muted" style={{ textAlign: "center", color: done ? "#a896ff" : "transparent", marginTop: 2 }}>
                          logged
                        </Text>
                      </Pressable>
                    );
                  })}

                  <Pressable
                    onPress={() => openStub("Custom faith log", "Custom faith logging comes next after this screen pass.")}
                    style={({ pressed }) => ({
                      width: width < 390 ? "48%" : "31%",
                      minWidth: 92,
                      borderRadius: 14,
                      borderCurve: "continuous",
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      backgroundColor: isDarkColorScheme ? "rgba(26, 26, 40, 0.96)" : "rgba(250, 250, 255, 0.98)",
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: theme.border,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <FontAwesome name="plus" size={14} color={theme.mutedForeground} style={{ textAlign: "center", marginBottom: 8 }} />
                    <Text selectable variant="small" style={{ textAlign: "center", color: theme.mutedForeground }}>
                      Other
                    </Text>
                  </Pressable>
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(270).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Bible reading" actionLabel="+ Log reading" onAction={() => navigateTo("/(tabs)/faith/readings")} />
              <Pressable onPress={() => navigateTo("/(tabs)/faith/readings")}>
                <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <IconWrap background="rgba(123, 109, 246, 0.16)">
                      <FontAwesome name="book" size={14} color="#a896ff" />
                    </IconWrap>
                    <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, flex: 1 }}>
                      Reading today
                    </Text>
                    <Text selectable variant="small" style={{ color: "#a896ff" }}>
                      6-day streak
                    </Text>
                  </View>
                  <Text selectable style={{ fontFamily: "Geist", fontSize: 16, fontWeight: "700", color: "#c8b8ff" }}>
                    Romans 8:1-17
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, fontStyle: "italic" }}>
                    There is therefore now no condemnation for those who are in Christ Jesus...
                  </Text>
                  <ProgressInline valueLabel="Romans · 42% complete" progress={42} color="#7b6df6" theme={theme} />
                </Card>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(320).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Prayer" actionLabel="+ Log prayer" onAction={() => navigateTo("/(tabs)/faith/prayers")} />
              <FaithLogCard
                title="Morning prayer"
                text="Gratitude for clarity this week. Prayed for direction on the Life OS build and the people in my life."
                meta={["Today · 6:12 AM", "Morning"]}
                icon="bullseye"
                iconColor="#a896ff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => navigateTo("/(tabs)/faith/prayers")}
                theme={theme}
              />
              <FaithLogCard
                title="Evening prayer"
                text="Quieter prayer. Fasting day made the evening feel more grounded. Interceded for a few specific things."
                meta={["Wed · 9:40 PM", "Evening", "Fasting day"]}
                icon="bullseye"
                iconColor="#a896ff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => navigateTo("/(tabs)/faith/prayers")}
                theme={theme}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(370).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Fasting" actionLabel="+ Log fast" onAction={() => navigateTo("/(tabs)/faith/practices")} />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 10, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <IconWrap background="rgba(123, 109, 246, 0.16)">
                    <FontAwesome name="dot-circle-o" size={14} color="#a896ff" />
                  </IconWrap>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, flex: 1 }}>
                    Fasting rhythm
                  </Text>
                  <Badge variant="outline" color="primary">
                    Wednesdays
                  </Badge>
                </View>
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: "#c8b8ff" }}>
                  Next fast - Wed Mar 19
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  Last fast: Wed Mar 12 · full day · intention set
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {["Feb 26", "Mar 5", "Mar 12", "Mar 19", "Mar 26"].map((date, index) => {
                    const isDone = index < 3;
                    const isUpcoming = index > 2;

                    return (
                      <View
                        key={date}
                        style={{
                          borderRadius: 10,
                          borderCurve: "continuous",
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          backgroundColor: isDone
                            ? "rgba(123, 109, 246, 0.14)"
                            : isUpcoming
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(123, 109, 246, 0.95)",
                          borderWidth: 1,
                          borderColor: isDone ? "rgba(123, 109, 246, 0.24)" : theme.border,
                        }}
                      >
                        <Text selectable variant="muted" style={{ color: isDone ? "#c8b8ff" : isUpcoming ? theme.mutedForeground : "#ffffff" }}>
                          {date}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(420).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Gratitude" actionLabel="+ Add" onAction={() => navigateTo("/(tabs)/faith/reflections")} />
              <FaithLogCard
                title="Gratitude · Thu"
                text="Grateful for the clarity that came from fasting this week. The Life OS work feels purposeful. Good health, good mind."
                meta={["Thu · 7:30 PM"]}
                icon="leaf"
                iconColor="#1fa97f"
                iconBackground="rgba(31, 169, 127, 0.14)"
                onPress={() => navigateTo("/(tabs)/faith/reflections")}
                theme={theme}
              />
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(220).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="This week · Mar 10-16" />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 14, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {RHYTHM_DAYS.map((day, index) => (
                    <View
                      key={`${day.day}-${day.current ? "current" : "normal"}-${index}`}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        borderCurve: "continuous",
                        paddingVertical: 10,
                        paddingHorizontal: 4,
                        alignItems: "center",
                        backgroundColor: day.current
                          ? isDarkColorScheme
                            ? "rgba(30, 26, 48, 0.96)"
                            : "rgba(241, 239, 255, 0.98)"
                          : day.active
                            ? isDarkColorScheme
                              ? "rgba(24, 24, 36, 0.96)"
                              : "rgba(249, 249, 255, 0.98)"
                            : isDarkColorScheme
                              ? "rgba(20, 20, 24, 0.96)"
                              : "rgba(250, 251, 253, 0.98)",
                        borderWidth: 1,
                        borderColor: day.current ? "rgba(123, 109, 246, 0.28)" : theme.border,
                        gap: 6,
                      }}
                    >
                      <Text selectable variant="muted" style={{ color: day.current ? "#c8b8ff" : theme.mutedForeground }}>
                        {day.day}
                      </Text>
                      <Dot color={day.prayer ? "#7b6df6" : "#2d2d35"} />
                      <Dot color={day.reading ? "#2f7dd1" : "#2d2d35"} />
                      <Dot color={day.fasting ? "#c8b8ff" : day.gratitude ? "#1fa97f" : "#2d2d35"} />
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <Legend color="#7b6df6" label="Prayer" />
                  <Legend color="#2f7dd1" label="Reading" />
                  <Legend color="#c8b8ff" label="Fasting" />
                  <Legend color="#1fa97f" label="Gratitude" />
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(270).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="March so far · 14 days" />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
                <SummaryRow label="Prayer" value="11/14" progress={78} color="#7b6df6" theme={theme} />
                <SummaryRow label="Bible reading" value="12/14" progress={85} color="#2f7dd1" theme={theme} />
                <SummaryRow label="Devotional" value="9/14" progress={64} color="#1fa97f" theme={theme} />
                <SummaryRow label="Gratitude" value="8/14" progress={57} color="#7fdab3" theme={theme} />
                <SummaryRow label="Fasting" value="3 fasts" progress={43} color="#c8b8ff" theme={theme} />
              </Card>
            </Animated.View>
          </>
        )}

        <Animated.View entering={FadeInDown.delay(470).duration(420)}>
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
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#a896ff", marginTop: 6 }} />
              <View style={{ flex: 1, gap: 10 }}>
                <Text selectable style={{ color: isDarkColorScheme ? "#c8c2ff" : "#5c54c9" }}>
                  Best faith week this month. Prayer is consistent, reading is strong, and one devotional today would close the loop.
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <ActionChip label="Log devotional" onPress={() => navigateTo("/(tabs)/faith/practices")} theme={theme} />
                  <ActionChip label="Set fast intention" onPress={() => openStub("Fast intention", "Intention capture is next after the UI work.")} theme={theme} />
                  <ActionChip label="30-day view" onPress={() => setView("rhythm")} theme={theme} />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MetricPill({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderCurve: "continuous",
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        gap: 4,
      }}
    >
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function MiniStat({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
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
      <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

function StreakCard({ title, value, accent, theme }: { title: string; value: string; accent: string; theme: AppTheme }) {
  return (
    <Card style={{ flex: 1, borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 10, boxShadow: theme.shadowSm }}>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 22, fontWeight: "700", color: accent, textAlign: "center", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ textAlign: "center", color: theme.mutedForeground }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <View
            key={`${title}-${index}`}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: index < Number(value) - 1 ? accent : index === Number(value) - 1 ? `${accent}cc` : "#2d2d35",
            }}
          />
        ))}
      </View>
    </Card>
  );
}

function FaithLogCard({
  title,
  text,
  meta,
  icon,
  iconColor,
  iconBackground,
  onPress,
  theme,
}: {
  title: string;
  text: string;
  meta: string[];
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 0, boxShadow: theme.shadowSm }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <IconWrap background={iconBackground}>
            <FontAwesome name={icon} size={13} color={iconColor} />
          </IconWrap>
          <View style={{ flex: 1, gap: 5 }}>
            <Text selectable variant="muted" style={{ color: iconColor, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Geist", fontWeight: "700" }}>
              {title}
            </Text>
            <Text selectable variant="small" style={{ color: theme.foreground }}>
              {text}
            </Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {meta.map((item) => (
                <View key={`${title}-${item}`} style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgba(123, 109, 246, 0.1)" }}>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: "#7b6df6", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
            <FontAwesome name="check" size={10} color="#ffffff" />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function ProgressInline({ valueLabel, progress, color, theme }: { valueLabel: string; progress: number; color: string; theme: AppTheme }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <View style={{ width: `${progress}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
        {valueLabel}
      </Text>
    </View>
  );
}

function SectionRow({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text selectable variant="small" style={{ color: "#7b6df6", fontFamily: "Geist", fontWeight: "700" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function IconWrap({ background, children }: { background: string; children: ReactNode }) {
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
      }}
    >
      {children}
    </View>
  );
}

function Dot({ color }: { color: string }) {
  return <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Dot color={color} />
      <Text selectable variant="muted">
        {label}
      </Text>
    </View>
  );
}

function SummaryRow({ label, value, progress, color, theme }: { label: string; value: string; progress: number; color: string; theme: AppTheme }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text selectable variant="small" style={{ color: theme.foreground, flex: 1 }}>
        {label}
      </Text>
      <View style={{ width: 88 }}>
        <View style={{ height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <View style={{ width: `${progress}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
        </View>
      </View>
      <Text selectable variant="small" style={{ width: 52, textAlign: "right", color, fontFamily: "Geist", fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  );
}

function ActionChip({ label, onPress, theme }: { label: string; onPress: () => void; theme: AppTheme }) {
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
      <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SegmentedControl({
  options,
  selected,
  onChange,
  theme,
}: {
  options: Array<{ id: string; label: string }>;
  selected: string;
  onChange: (value: string) => void;
  theme: AppTheme;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 16,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((option) => {
        const active = option.id === selected;

        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 12,
              borderCurve: "continuous",
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "transparent",
              borderWidth: active ? 1 : 0,
              borderColor: active ? "rgba(123, 109, 246, 0.28)" : "transparent",
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text selectable variant="small" style={{ color: active ? "#c8b8ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
