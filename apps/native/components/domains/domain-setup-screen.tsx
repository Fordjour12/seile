import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Card, Switch, Text } from "@/components/ui";
import { useSettingsTheme } from "@/components/settings/shared";
import { UI_PRESETS } from "@/lib/constants";

// ─── Domain config ──────────────────────────────────────────────────────────

type RowRight =
  | { type: "arrow" }
  | { type: "value"; value: string }
  | { type: "badge-todo" }
  | { type: "badge-done" }
  | { type: "toggle"; toggleKey: string; initial?: boolean }
  | { type: "danger" };

type SetupRowConfig = {
  label: string;
  sub: string;
  right: RowRight;
};

type SetupSectionConfig = {
  title: string;
  rows: SetupRowConfig[];
};

type DomainConfig = {
  key: string;
  name: string;
  emoji: string;
  description: string;
  lightAccent: string;
  lightBg: string;
  lightBorder: string;
  darkAccent: string;
  darkBg: string;
  darkBorder: string;
  sections: SetupSectionConfig[];
};

export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  finance: {
    key: "finance",
    name: "Finance",
    emoji: "💰",
    description:
      "Track your money, set savings targets, and build better financial habits over time.",
    lightAccent: "#1A6B3A",
    lightBg: "#E8F5EE",
    lightBorder: "#B7DEC9",
    darkAccent: "#6fcf97",
    darkBg: "#0d1f14",
    darkBorder: "#1a5930",
    sections: [
      {
        title: "Accounts",
        rows: [
          {
            label: "Link your accounts",
            sub: "Checking, savings, credit cards",
            right: { type: "badge-todo" },
          },
          {
            label: "Monthly budget",
            sub: "Set your overall spending limit",
            right: { type: "badge-todo" },
          },
        ],
      },
      {
        title: "Goals",
        rows: [
          {
            label: "Primary goal",
            sub: "What are you saving toward?",
            right: { type: "badge-todo" },
          },
          {
            label: "Savings target",
            sub: "Monthly amount to set aside",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Notifications",
        rows: [
          {
            label: "Weekly summary",
            sub: "Spending recap every Sunday",
            right: { type: "toggle", toggleKey: "weekly-summary", initial: true },
          },
          {
            label: "Overspend alerts",
            sub: "Notify when nearing category limits",
            right: { type: "toggle", toggleKey: "overspend", initial: false },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Finance",
            sub: "Hide from activities and suggestions",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  career: {
    key: "career",
    name: "Career",
    emoji: "💼",
    description:
      "Set professional goals, track projects, and build skills that move you forward.",
    lightAccent: "#1A4A8A",
    lightBg: "#E8F0FB",
    lightBorder: "#B8CFF5",
    darkAccent: "#85b7eb",
    darkBg: "#0a1220",
    darkBorder: "#1a3860",
    sections: [
      {
        title: "Your role",
        rows: [
          {
            label: "Current role",
            sub: "Job title or type of work",
            right: { type: "value", value: "—" },
          },
          {
            label: "Industry",
            sub: "Helps tailor suggestions",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Goals",
        rows: [
          {
            label: "Career goal",
            sub: "What are you working toward?",
            right: { type: "badge-todo" },
          },
          {
            label: "Skill to develop",
            sub: "One skill this month",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Career",
            sub: "Hide from activities and suggestions",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  health: {
    key: "health",
    name: "Health",
    emoji: "💪",
    description:
      "Build sustainable movement, sleep, and nutrition habits that compound over time.",
    lightAccent: "#8A1A1A",
    lightBg: "#FBE8E8",
    lightBorder: "#F5B8B8",
    darkAccent: "#f0997b",
    darkBg: "#200a0a",
    darkBorder: "#5c1a1a",
    sections: [
      {
        title: "Body",
        rows: [
          {
            label: "Sleep target",
            sub: "Hours per night",
            right: { type: "value", value: "—" },
          },
          {
            label: "Movement goal",
            sub: "Minutes per day",
            right: { type: "value", value: "—" },
          },
          {
            label: "Water intake",
            sub: "Daily target in litres",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Connect",
        rows: [
          {
            label: "Apple Health",
            sub: "Sync steps and sleep data",
            right: { type: "badge-todo" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Health",
            sub: "Hide from activities and suggestions",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  faith: {
    key: "faith",
    name: "Faith",
    emoji: "✦",
    description:
      "Build a consistent prayer and devotional rhythm that fits your daily life.",
    lightAccent: "#6B3A1A",
    lightBg: "#FDF3E0",
    lightBorder: "#F0D090",
    darkAccent: "#b4adf5",
    darkBg: "#160e2a",
    darkBorder: "#3d3570",
    sections: [
      {
        title: "Rhythm",
        rows: [
          {
            label: "Prayer time",
            sub: "When do you prefer to pray?",
            right: { type: "value", value: "6:00 AM" },
          },
          {
            label: "Devotional plan",
            sub: "Reading plan or custom",
            right: { type: "badge-done" },
          },
          {
            label: "Bible translation",
            sub: "Preferred version",
            right: { type: "value", value: "NIV" },
          },
        ],
      },
      {
        title: "Accountability",
        rows: [
          {
            label: "Prayer partner",
            sub: "Optional — share streaks",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Faith",
            sub: "Remove from activities",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  relationships: {
    key: "relationships",
    name: "Relationships",
    emoji: "🤝",
    description:
      "Stay intentional with the people who matter — family, friends, community.",
    lightAccent: "#6B1A6B",
    lightBg: "#F5E8FB",
    lightBorder: "#D8B8F0",
    darkAccent: "#ed93b1",
    darkBg: "#1a0a1a",
    darkBorder: "#5c1a5c",
    sections: [
      {
        title: "Focus",
        rows: [
          {
            label: "Priority relationship",
            sub: "Who needs the most attention?",
            right: { type: "value", value: "—" },
          },
          {
            label: "Check-in frequency",
            sub: "How often to prompt connection",
            right: { type: "value", value: "Weekly" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Relationships",
            sub: "Hide from activities",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  wellness: {
    key: "wellness",
    name: "Wellness",
    emoji: "🌿",
    description:
      "Track energy, mood, and mental well-being to build resilience over time.",
    lightAccent: "#1A6B6B",
    lightBg: "#E8F5F5",
    lightBorder: "#B8DFE0",
    darkAccent: "#40d4c0",
    darkBg: "#051414",
    darkBorder: "#0a4040",
    sections: [
      {
        title: "Check-ins",
        rows: [
          {
            label: "Daily check-in reminder",
            sub: "Mood, energy, focus prompt",
            right: { type: "toggle", toggleKey: "daily-checkin", initial: true },
          },
          {
            label: "Check-in time",
            sub: "Best time for a quick reflection",
            right: { type: "value", value: "8:00 AM" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Wellness",
            sub: "Hide from activities",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  productivity: {
    key: "productivity",
    name: "Tasks",
    emoji: "✅",
    description:
      "Capture, prioritise, and complete tasks that move the needle on what matters.",
    lightAccent: "#5F5E5A",
    lightBg: "#F5F4F1",
    lightBorder: "#D4D1CA",
    darkAccent: "#A8A5A0",
    darkBg: "#121210",
    darkBorder: "#3a3830",
    sections: [
      {
        title: "Workflow",
        rows: [
          {
            label: "Daily priorities count",
            sub: "How many priorities per day",
            right: { type: "value", value: "3" },
          },
          {
            label: "Review time",
            sub: "When to review tomorrow's list",
            right: { type: "value", value: "9:00 PM" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Tasks",
            sub: "Hide from activities",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },

  space: {
    key: "space",
    name: "Space",
    emoji: "🏠",
    description:
      "Organise your physical environment — rooms, zones, and recurring resets.",
    lightAccent: "#444444",
    lightBg: "#F2F2F2",
    lightBorder: "#D0D0D0",
    darkAccent: "#999999",
    darkBg: "#111111",
    darkBorder: "#333333",
    sections: [
      {
        title: "Zones",
        rows: [
          {
            label: "Add a zone",
            sub: "Kitchen, desk, garage, etc.",
            right: { type: "badge-todo" },
          },
          {
            label: "Reset schedule",
            sub: "Weekly or monthly clean-up cycles",
            right: { type: "value", value: "—" },
          },
        ],
      },
      {
        title: "Danger zone",
        rows: [
          {
            label: "Deactivate Space",
            sub: "Hide from activities",
            right: { type: "danger" },
          },
        ],
      },
    ],
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function TopBar({
  title,
  accentColor,
}: {
  title: string;
  accentColor: string;
}) {
  const { theme } = useSettingsTheme();
  return (
    <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => [
          styles.backBtn,
          { borderColor: theme.border, backgroundColor: theme.card },
          pressed && { opacity: 0.7 },
        ]}
      >
        <FontAwesome name="angle-left" size={16} color={theme.mutedForeground} />
      </Pressable>

      <Text
        selectable
        variant="small"
        style={[styles.topBarTitle, { color: theme.foreground }]}
      >
        {title}
      </Text>

      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text selectable variant="small" style={{ color: accentColor, fontWeight: "600" }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}

function DomainHero({
  config,
  accentColor,
  accentBg,
  isActive,
  onToggle,
}: {
  config: DomainConfig;
  accentColor: string;
  accentBg: string;
  isActive: boolean;
  onToggle: (v: boolean) => void;
}) {
  const { theme } = useSettingsTheme();
  return (
    <View style={styles.hero}>
      <View style={[styles.heroIcon, { backgroundColor: accentBg }]}>
        <Text selectable style={styles.heroEmoji}>
          {config.emoji}
        </Text>
      </View>
      <Text selectable style={[styles.heroName, { color: theme.foreground }]}>
        {config.name}
      </Text>
      <Text selectable variant="small" style={[styles.heroDesc, { color: theme.mutedForeground }]}>
        {config.description}
      </Text>

      <View style={[styles.activeRow, { borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text selectable variant="small" style={[styles.activeLabel, { color: theme.foreground }]}>
            {isActive ? `${config.name} is active` : `Activate ${config.name}`}
          </Text>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 2 }}>
            {isActive
              ? "Activities and suggestions are on"
              : `Show ${config.name} activities and suggestions`}
          </Text>
        </View>
        <Switch value={isActive} onValueChange={onToggle} />
      </View>
    </View>
  );
}

function SetupSection({
  config,
  accentColor,
  accentBg,
  accentBorder,
  toggles,
  onToggle,
  onDeactivate,
}: {
  config: SetupSectionConfig;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  onDeactivate?: () => void;
}) {
  const { theme, isDarkColorScheme } = useSettingsTheme();
  const isDanger = config.title === "Danger zone";

  return (
    <View style={styles.sectionWrap}>
      <Text
        selectable
        variant="muted"
        style={[styles.sectionLabel, { color: theme.mutedForeground }]}
      >
        {config.title}
      </Text>
      <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
        {config.rows.map((row, i) => (
          <React.Fragment key={row.label}>
            <SetupRow
              row={row}
              accentColor={accentColor}
              accentBg={accentBg}
              accentBorder={accentBorder}
              toggles={toggles}
              onToggle={onToggle}
              isDanger={isDanger}
              theme={theme}
              onDeactivate={onDeactivate}
            />
            {i < config.rows.length - 1 ? (
              <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />
            ) : null}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
}

function SetupRow({
  row,
  accentColor,
  accentBg,
  accentBorder,
  toggles,
  onToggle,
  isDanger,
  theme,
  onDeactivate,
}: {
  row: SetupRowConfig;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  isDanger: boolean;
  theme: ReturnType<typeof useSettingsTheme>["theme"];
  onDeactivate?: () => void;
}) {
  const right = row.right;
  const isToggle = right.type === "toggle";
  const isDeactivate = right.type === "danger";

  function handlePress() {
    if (isDeactivate) {
      Alert.alert(
        row.label,
        "This will hide this domain from your first-run and suggestions.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: () => onDeactivate?.(),
          },
        ],
      );
    } else if (!isToggle) {
      Alert.alert(row.label, row.sub + "\n\nThis field will be editable in the full release.");
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && !isToggle && { opacity: 0.7 }]}
    >
      <View style={styles.rowLeft}>
        <Text
          selectable
          variant="small"
          style={[
            styles.rowLabel,
            { color: isDeactivate ? "#e24b4a" : theme.foreground },
          ]}
        >
          {row.label}
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 2 }}>
          {row.sub}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {right.type === "badge-todo" ? (
          <View style={[styles.badge, { backgroundColor: theme.muted, borderColor: theme.border }]}>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontSize: 11 }}>
              Not set
            </Text>
          </View>
        ) : right.type === "badge-done" ? (
          <View
            style={[styles.badge, { backgroundColor: accentBg, borderColor: accentBorder }]}
          >
            <Text selectable variant="muted" style={{ color: accentColor, fontSize: 11 }}>
              Set
            </Text>
          </View>
        ) : right.type === "toggle" ? (
          <Switch
            value={toggles[right.toggleKey] ?? right.initial ?? false}
            onValueChange={(v) => onToggle(right.toggleKey, v)}
          />
        ) : right.type === "value" ? (
          <>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {right.value}
            </Text>
            <FontAwesome name="angle-right" size={15} color={theme.mutedForeground} />
          </>
        ) : (
          <FontAwesome name="angle-right" size={15} color={theme.mutedForeground} />
        )}
      </View>
    </Pressable>
  );
}

// ─── Main exported screen ────────────────────────────────────────────────────

export function DomainSetupScreen({ domainKey }: { domainKey: string }) {
  const { theme, isDarkColorScheme } = useSettingsTheme();
  const config = DOMAIN_CONFIGS[domainKey];

  // Convex: read current domain status
  const domainStatus = useQuery(
    api.domains.getDomainStatus,
    domainKey ? { domain: domainKey as any } : "skip",
  );
  const activate = useMutation(api.domains.activateDomain);
  const deactivate = useMutation(api.domains.deactivateDomain);

  // Derive active state from Convex (fallback to inactive while loading)
  const isActive =
    domainStatus?.status === "active" || domainStatus?.status === "pinned";

  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    config?.sections.forEach((s) =>
      s.rows.forEach((r) => {
        if (r.right.type === "toggle") {
          init[r.right.toggleKey] = r.right.initial ?? false;
        }
      }),
    );
    return init;
  });

  if (!config) {
    return (
      <View style={[styles.notFound, { backgroundColor: theme.background }]}>
        <Text selectable style={{ color: theme.foreground }}>
          Domain "{domainKey}" not found.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text selectable style={{ color: theme.primary }}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const accentColor = isDarkColorScheme ? config.darkAccent : config.lightAccent;
  const accentBg = isDarkColorScheme ? config.darkBg : config.lightBg;
  const accentBorder = isDarkColorScheme ? config.darkBorder : config.lightBorder;

  function handleToggle(key: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }

  async function handleActivateToggle(value: boolean) {
    const d = domainKey as any;
    if (value) {
      await activate({ domain: d });
    } else {
      await deactivate({ domain: d });
    }
  }

  async function handleDeactivate() {
    const d = domainKey as any;
    await deactivate({ domain: d });
    router.back();
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TopBar title={config.name} accentColor={accentColor} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <DomainHero
          config={config}
          accentColor={accentColor}
          accentBg={accentBg}
          isActive={isActive}
          onToggle={handleActivateToggle}
        />

        {config.sections.map((section) => (
          <SetupSection
            key={section.title}
            config={section}
            accentColor={accentColor}
            accentBg={accentBg}
            accentBorder={accentBorder}
            toggles={toggles}
            onToggle={handleToggle}
            onDeactivate={handleDeactivate}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 60,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },

  // Hero
  hero: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.section,
    paddingBottom: 0,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroEmoji: {
    fontSize: 24,
  },
  heroName: {
    fontFamily: "Geist",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroDesc: {
    lineHeight: 22,
    marginBottom: 4,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  activeLabel: {
    fontWeight: "600",
  },

  // Sections
  sectionWrap: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    padding: 0,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.xxl,
    gap: UI_PRESETS.spacing.xl,
  },
  rowLeft: {
    flex: 1,
  },
  rowLabel: {
    fontWeight: "500",
    fontSize: 14,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.md,
    flexShrink: 0,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: UI_PRESETS.spacing.xxxl,
  },

  // Badge
  badge: {
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: 3,
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
  },
});
