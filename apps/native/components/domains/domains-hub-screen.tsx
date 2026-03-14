import { useMemo, useState, type ComponentProps } from "react";
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

import { Badge, Button, Card, Chip, Text } from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type DomainFilter = "all" | "active" | "needs-attention" | "strong";

type DomainShortcut = {
  id: string;
  label: string;
  href?: string;
  message?: string;
};

type DomainCardItem = {
  id: string;
  name: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  accent: string;
  iconBackground: string;
  statusLine: string;
  score: number;
  tags: string[];
  nudge: string;
  section: "pinned" | "active" | "inactive";
  href?: string;
  inactiveLabel?: string;
  shortcuts?: DomainShortcut[];
};

const DOMAIN_FILTERS: Array<{ id: DomainFilter; label: string }> = [
  { id: "all", label: "All domains" },
  { id: "active", label: "Active" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "strong", label: "Strong" },
];

const DOMAIN_ITEMS: DomainCardItem[] = [
  {
    id: "faith",
    name: "Faith",
    icon: "bullseye",
    accent: "#5b50d6",
    iconBackground: "rgba(91, 80, 214, 0.16)",
    statusLine: "5 prayer days · 1 fast · Bible reading daily",
    score: 85,
    tags: ["Prayer 5/7", "Fasting", "Devotional daily"],
    nudge: "Strong week. Consider adding a fasting intention today to close the week spiritually.",
    section: "pinned",
    href: "/(tabs)/domains/faith",
    shortcuts: [
      { id: "prayer", label: "+ Prayer", href: "/(tabs)/faith/prayers" },
      { id: "reading", label: "+ Reading", href: "/(tabs)/faith/readings" },
      { id: "gratitude", label: "+ Gratitude", href: "/(tabs)/faith/reflections" },
    ],
  },
  {
    id: "career",
    name: "Career",
    icon: "briefcase",
    accent: "#2d8cff",
    iconBackground: "rgba(45, 140, 255, 0.12)",
    statusLine: "Life OS build · deep work streak active",
    score: 90,
    tags: ["On track", "5 day streak"],
    nudge: "Best domain this week. UI screens progressing well.",
    section: "active",
    href: "/(tabs)/domains/career",
  },
  {
    id: "finance",
    name: "Finance",
    icon: "money",
    accent: "#1fa97f",
    iconBackground: "rgba(31, 169, 127, 0.12)",
    statusLine: "Budget review overdue · 4 days",
    score: 55,
    tags: ["Needs attention"],
    nudge: "Budget review deferred since Monday. GH₵1,240 remaining.",
    section: "active",
    href: "/(tabs)/domains/finance",
  },
  {
    id: "health",
    name: "Health",
    icon: "heartbeat",
    accent: "#da7a36",
    iconBackground: "rgba(218, 122, 54, 0.12)",
    statusLine: "2 training sessions · avg energy 6.2",
    score: 70,
    tags: ["Consistent", "Energy low"],
    nudge: "Energy mid-week dipped. Decompression walks helped recovery.",
    section: "active",
    href: "/(tabs)/domains/health",
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: "smile-o",
    accent: "#d45689",
    iconBackground: "rgba(212, 86, 137, 0.12)",
    statusLine: "Avg mood 7.1 · 3 decompression walks",
    score: 60,
    tags: ["Stable"],
    nudge: "Mood steady. Rest day Saturday will help close the week well.",
    section: "active",
    href: "/(tabs)/domains/wellness",
  },
  {
    id: "tasks",
    name: "Tasks",
    icon: "check-square-o",
    accent: "#8a8f9c",
    iconBackground: "rgba(138, 143, 156, 0.14)",
    statusLine: "8 done · 2 deferred to next week",
    score: 72,
    tags: ["2 deferred"],
    nudge: "2 tasks need a home next week. Slotted for Monday.",
    section: "active",
    href: "/(tabs)/domains/tasks",
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: "users",
    accent: "#596273",
    iconBackground: "rgba(89, 98, 115, 0.12)",
    statusLine: "No activity this week",
    score: 0,
    tags: [],
    nudge: "",
    section: "inactive",
    inactiveLabel: "No activity this week · tap to activate",
  },
  {
    id: "space",
    name: "Space",
    icon: "home",
    accent: "#996a2e",
    iconBackground: "rgba(153, 106, 46, 0.12)",
    statusLine: "Single-room zone",
    score: 0,
    tags: [],
    nudge: "",
    section: "inactive",
    inactiveLabel: "Single-room zone · tap to activate",
  },
];

export function DomainsHubScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [filter, setFilter] = useState<DomainFilter>("all");

  const weekLabel = useMemo(() => getWeekLabel(), []);
  const activeDomains = DOMAIN_ITEMS.filter((item) => item.section !== "inactive");
  const filteredDomains = activeDomains.filter((item) => {
    if (filter === "needs-attention") {
      return item.score < 65;
    }

    if (filter === "strong") {
      return item.score >= 80;
    }

    return true;
  });

  const featuredDomain = filteredDomains.find((item) => item.section === "pinned");
  const gridDomains = filteredDomains.filter((item) => item.id !== featuredDomain?.id);
  const showInactiveSection = filter === "all" || filter === "active";
  const overallScore = 71;
  const compactCards = width < 390;

  function openDestination(item: DomainCardItem) {
    if (item.href) {
      router.push(item.href as never);
      return;
    }

    RNAlert.alert(
      `${item.name} coming next`,
      `${item.name} exists in the hub design, but its full route is not built yet.`,
    );
  }

  function openShortcut(shortcut: DomainShortcut) {
    if (shortcut.href) {
      router.push(shortcut.href as never);
      return;
    }

    if (shortcut.message) {
      RNAlert.alert(shortcut.label, shortcut.message);
      return;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -56,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(218, 122, 54, 0.12)" : "rgba(218, 122, 54, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 220,
          left: -90,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(91, 80, 214, 0.1)" : "rgba(91, 80, 214, 0.08)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Badge variant="subtle" color="warning">
              Weekly domain pulse
            </Badge>
            <Text
              selectable
              style={{
                ...Typography.captionLG,
                color: theme.mutedForeground,
              }}
            >
              {weekLabel}
            </Text>
          </View>

          <Card
            style={{
              borderRadius: 24,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowMd,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ ...Typography.bodySM, color: theme.mutedForeground }}>
                Overall life health this week
              </Text>
              <Text
                selectable
                style={{
                  fontFamily: "Figtree",
                  fontSize: 24,
                  fontWeight: "600",
                  lineHeight: 28,
                  fontVariant: ["tabular-nums"],
                  color: theme.foreground,
                }}
              >
                {overallScore}%
              </Text>
            </View>

            <View
              style={{
                height: 8,
                borderRadius: 999,
                backgroundColor: isDarkColorScheme ? "rgba(33, 33, 41, 1)" : "rgba(223, 226, 237, 0.9)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${overallScore}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: "#1fa97f",
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 4 }}>
              {DOMAIN_ITEMS.map((domain) => (
                <View
                  key={domain.id}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: domain.accent,
                    opacity: domain.section === "inactive" ? 0.35 : Math.max(domain.score / 100, 0.45),
                  }}
                />
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DOMAIN_FILTERS.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                selected={filter === item.id}
                onSelect={() => setFilter(item.id)}
              />
            ))}
          </View>
        </Animated.View>

        {featuredDomain ? (
          <Animated.View entering={FadeInDown.delay(110).duration(420)}>
            {(filter === "all" || filter === "active") && (
              <SectionLabel label="Pinned" />
            )}
            <FeaturedDomainCard domain={featuredDomain} onOpen={openDestination} onShortcut={openShortcut} />
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(160).duration(420)}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {gridDomains.map((domain) => (
              <View
                key={domain.id}
                style={{
                  width: compactCards ? "100%" : "48.5%",
                }}
              >
                <DomainCard domain={domain} onOpen={openDestination} />
              </View>
            ))}
          </View>
        </Animated.View>

        {showInactiveSection ? (
          <Animated.View entering={FadeInDown.delay(220).duration(420)} style={{ gap: 10 }}>
            <SectionLabel label="Inactive this week" />
            {DOMAIN_ITEMS.filter((item) => item.section === "inactive").map((domain) => (
              <InactiveDomainRow key={domain.id} domain={domain} onOpen={openDestination} />
            ))}
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Text
      style={{
        ...Typography.labelXS,
        color: theme.mutedForeground,
      }}
    >
      {label}
    </Text>
  );
}

function FeaturedDomainCard({
  domain,
  onOpen,
  onShortcut,
}: {
  domain: DomainCardItem;
  onOpen: (domain: DomainCardItem) => void;
  onShortcut: (shortcut: DomainShortcut) => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Card
      style={{
        borderRadius: 24,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        boxShadow: theme.shadowMd,
        overflow: "hidden",
        padding: 0,
      }}
    >
      <View style={{ height: 3, backgroundColor: domain.accent, opacity: 0.88 }} />
      <Pressable
        onPress={() => onOpen(domain)}
        style={({ pressed }) => ({
          padding: 16,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              borderCurve: "continuous",
              backgroundColor: domain.iconBackground,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome name={domain.icon} size={18} color={domain.accent} />
          </View>

          <View style={{ flex: 1, gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ ...Typography.titleMD, color: theme.foreground }}>{domain.name}</Text>
              <Text style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
                {domain.statusLine}
              </Text>
            </View>

            <ProgressRow score={domain.score} accent={domain.accent} />

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {domain.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={isDarkColorScheme ? "subtle" : "outline"}
                  color="secondary"
                >
                  {tag}
                </Badge>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: theme.border,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: domain.accent,
                  marginTop: 6,
                }}
              />
              <Text style={{ ...Typography.bodyXS, color: domain.accent, flex: 1 }}>
                {domain.nudge}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {domain.shortcuts?.length ? (
        <View style={{ flexDirection: "row", gap: 8, padding: 16, paddingTop: 0 }}>
          {domain.shortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              title={shortcut.label}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => onShortcut(shortcut)}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function DomainCard({
  domain,
  onOpen,
}: {
  domain: DomainCardItem;
  onOpen: (domain: DomainCardItem) => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={() => onOpen(domain)}
      style={({ pressed }) => ({
        borderRadius: 20,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        boxShadow: theme.shadowSm,
        overflow: "hidden",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ height: 3, backgroundColor: domain.accent, opacity: domain.section === "inactive" ? 0.36 : 0.8 }} />
      <View style={{ padding: 14, gap: 10 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            borderCurve: "continuous",
            backgroundColor: domain.iconBackground,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name={domain.icon} size={16} color={domain.accent} />
        </View>

        <View style={{ gap: 3 }}>
          <Text style={{ ...Typography.titleSM, color: theme.foreground }}>{domain.name}</Text>
          <Text
            style={{
              ...Typography.captionLG,
              color: domain.score < 65 ? "#dba460" : theme.mutedForeground,
            }}
          >
            {domain.statusLine}
          </Text>
        </View>

        <ProgressRow score={domain.score} accent={domain.accent} compact />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {domain.tags.map((tag) => (
            <Badge
              key={tag}
              variant={isDarkColorScheme ? "subtle" : "outline"}
              color={domain.score < 65 ? "warning" : "secondary"}
            >
              {tag}
            </Badge>
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: domain.score < 65 ? "#dba460" : domain.accent,
              marginTop: 5,
            }}
          />
          <Text
            style={{
              ...Typography.bodyXS,
              color: domain.score < 65 ? "#dba460" : domain.accent,
              flex: 1,
            }}
          >
            {domain.nudge}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function InactiveDomainRow({
  domain,
  onOpen,
}: {
  domain: DomainCardItem;
  onOpen: (domain: DomainCardItem) => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={() => onOpen(domain)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 18,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
        opacity: pressed ? 0.74 : 0.58,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          borderCurve: "continuous",
          backgroundColor: domain.iconBackground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome name={domain.icon} size={14} color={domain.accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...Typography.labelMD, color: theme.foreground }}>{domain.name}</Text>
        <Text style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
          {domain.inactiveLabel}
        </Text>
      </View>
      <Text style={{ ...Typography.captionLG, color: theme.mutedForeground }}>+ Activate</Text>
    </Pressable>
  );
}

function ProgressRow({
  score,
  accent,
  compact = false,
}: {
  score: number;
  accent: string;
  compact?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          flex: 1,
          height: compact ? 4 : 5,
          borderRadius: 999,
          backgroundColor: isLowContrastBackground(colorScheme) ? "rgba(36, 37, 47, 1)" : "rgba(222, 225, 235, 0.9)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${score}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: accent,
          }}
        />
      </View>
      <Text
        selectable
        style={{
          fontFamily: "Figtree",
          fontSize: compact ? 11 : 12,
          fontWeight: "500",
          lineHeight: compact ? 16 : 17,
          fontVariant: ["tabular-nums"],
          color: score < 65 ? "#dba460" : theme.foreground,
          width: compact ? 30 : 34,
          textAlign: "right",
        }}
      >
        {score}%
      </Text>
    </View>
  );
}

function isLowContrastBackground(colorScheme: string) {
  return colorScheme === "dark";
}

function getWeekLabel() {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  return `Week of ${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}
