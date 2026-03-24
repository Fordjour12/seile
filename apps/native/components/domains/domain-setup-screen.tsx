import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Badge, Button, Separator, Switch, Text } from "@/components/ui";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

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

type DomainSettings = Record<string, string | boolean>;

type SetupSectionConfig = {
  title: string;
  rows: SetupRowConfig[];
};

type DomainConfig = {
  key: string;
  name: string;
  emoji: string;
  description: string;
  accent: string;
  accentMuted: string;
  sections: SetupSectionConfig[];
};

export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  finance: {
    key: "finance",
    name: "Finance",
    emoji: "💰",
    description:
      "Track your money, set savings targets, and build better financial habits over time.",
    accent: "#6fcf97",
    accentMuted: "#6fcf9718",
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
            right: {
              type: "toggle",
              toggleKey: "weekly-summary",
              initial: true,
            },
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
            sub: "Hide from first-run and suggestions",
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
    accent: "#85b7eb",
    accentMuted: "#85b7eb18",
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
            sub: "Hide from first-run and suggestions",
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
    accent: "#f0997b",
    accentMuted: "#f0997b18",
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
            sub: "Hide from first-run and suggestions",
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
    accent: "#b4adf5",
    accentMuted: "#b4adf518",
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
    accent: "#ed93b1",
    accentMuted: "#ed93b118",
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
    accent: "#40d4c0",
    accentMuted: "#40d4c018",
    sections: [
      {
        title: "Check-ins",
        rows: [
          {
            label: "Daily check-in reminder",
            sub: "Mood, energy, focus prompt",
            right: {
              type: "toggle",
              toggleKey: "daily-checkin",
              initial: true,
            },
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
    accent: "#A8A5A0",
    accentMuted: "#A8A5A018",
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

  tasks: {
    key: "tasks",
    name: "Tasks",
    emoji: "✅",
    description:
      "Capture, prioritise, and complete tasks that move the needle on what matters.",
    accent: "#A8A5A0",
    accentMuted: "#A8A5A018",
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
    accent: "#999999",
    accentMuted: "#99999918",
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

// ─── Theme hook ──────────────────────────────────────────────────────────────

function useDomainTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  return { theme, isDark: isDarkColorScheme };
}

function getRowSettingKey(row: SetupRowConfig) {
  if (row.right.type === "toggle") {
    return row.right.toggleKey;
  }

  return row.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStoredRowValue(
  row: SetupRowConfig,
  settings: DomainSettings,
): string | boolean | undefined {
  return settings[getRowSettingKey(row)];
}

function getRowDisplayValue(
  row: SetupRowConfig,
  settings: DomainSettings,
): string | undefined {
  const stored = getStoredRowValue(row, settings);
  if (typeof stored === "string" && stored.trim().length > 0) {
    return stored;
  }

  if (row.right.type === "value") {
    return row.right.value;
  }

  return undefined;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/* ── Top navigation bar ─────────────────────────────────────────────────── */

function TopBar({
  title,
  accentColor,
}: {
  title: string;
  accentColor: string;
}) {
  const { theme } = useDomainTheme();

  return (
    <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: theme.muted },
          pressed && { opacity: 0.6 },
        ]}
      >
        <FontAwesome
          name="chevron-left"
          size={11}
          color={theme.mutedForeground}
        />
      </Pressable>

      <Text
        selectable
        variant="small"
        style={[styles.topBarTitle, { color: theme.foreground }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [
          styles.doneBtn,
          { backgroundColor: `${accentColor}18` },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text
          selectable
          variant="small"
          style={[styles.doneBtnText, { color: accentColor }]}
        >
          Done
        </Text>
      </Pressable>
    </View>
  );
}

/* ── Activation hero — shown when domain is INACTIVE ────────────────────── */

function InactiveHero({
  config,
  onActivate,
}: {
  config: DomainConfig;
  onActivate: () => void;
}) {
  const { theme } = useDomainTheme();

  return (
    <View style={styles.inactiveHero}>
      {/* Large emoji */}
      <View
        style={[styles.heroIconLg, { backgroundColor: config.accentMuted }]}
      >
        <Text selectable style={styles.heroEmojiLg}>
          {config.emoji}
        </Text>
      </View>

      <Text selectable style={[styles.heroName, { color: theme.foreground }]}>
        {config.name}
      </Text>

      <Text
        selectable
        variant="body"
        style={[styles.heroDesc, { color: theme.mutedForeground }]}
      >
        {config.description}
      </Text>

      {/* Inactive status pill */}
      <View style={[styles.statusPill, { backgroundColor: theme.muted }]}>
        <View style={[styles.statusDot, { backgroundColor: theme.mutedForeground }]} />
        <Text
          selectable
          variant="small"
          style={{ color: theme.mutedForeground, fontWeight: "500" }}
        >
          Not activated
        </Text>
      </View>

      {/* Activation CTA */}
      <View
        style={[
          styles.activateCta,
          {
            backgroundColor: `${config.accent}10`,
            borderColor: `${config.accent}30`,
          },
        ]}
      >
        <View style={styles.activateCtaBody}>
          <Text
            selectable
            variant="small"
            style={[styles.activateCtaTitle, { color: theme.foreground }]}
          >
            Ready to activate?
          </Text>
          <Text
            selectable
            variant="muted"
            style={{ color: theme.mutedForeground, lineHeight: 16 }}
          >
            Turn on {config.name} to unlock activities, suggestions, and
            tracking for this domain.
          </Text>
        </View>

        <Button
          title={`Activate ${config.name}`}
          variant="primary"
          size="md"
          onPress={onActivate}
          style={{ backgroundColor: config.accent }}
        />
      </View>

      {/* Locked sections preview */}
      <View style={styles.lockedPreview}>
        <View style={styles.lockedHeader}>
          <FontAwesome name="lock" size={11} color={theme.mutedForeground} />
          <Text
            selectable
            variant="muted"
            style={[styles.lockedTitle, { color: theme.mutedForeground }]}
          >
            Settings available after activation
          </Text>
        </View>

        {config.sections
          .filter((s) => !s.title.toLowerCase().includes("danger"))
          .map((section) => (
            <View
              key={section.title}
              style={[
                styles.lockedRow,
                { borderColor: theme.border },
              ]}
            >
              <Text
                selectable
                variant="small"
                style={{ color: theme.mutedForeground, opacity: 0.6 }}
              >
                {section.title}
              </Text>
              <Badge variant="subtle" color="default">
                {`${section.rows.length} ${section.rows.length === 1 ? "setting" : "settings"}`}
              </Badge>
            </View>
          ))}
      </View>
    </View>
  );
}

/* ── Active hero — shown when domain IS active ──────────────────────────── */

function ActiveHero({
  config,
  isPinned,
  onTogglePin,
  pinnedCount,
}: {
  config: DomainConfig;
  isPinned: boolean;
  onTogglePin: () => void;
  pinnedCount: number;
}) {
  const { theme } = useDomainTheme();

  return (
    <View style={styles.activeHero}>
      <View style={styles.activeHeroTop}>
        {/* Icon + info */}
        <View
          style={[styles.heroIconSm, { backgroundColor: config.accentMuted }]}
        >
          <Text selectable style={styles.heroEmojiSm}>
            {config.emoji}
          </Text>
        </View>

        <View style={styles.activeHeroInfo}>
          <Text
            selectable
            style={[styles.heroNameSm, { color: theme.foreground }]}
          >
            {config.name}
          </Text>
          <Text
            selectable
            variant="muted"
            style={{ color: theme.mutedForeground }}
          >
            {config.description}
          </Text>
        </View>
      </View>

      {/* Status row */}
      <View style={[styles.activeStatusRow, { borderColor: theme.border }]}>
        <View style={styles.statusPillActive}>
          <View
            style={[styles.statusDot, { backgroundColor: config.accent }]}
          />
          <Text
            selectable
            variant="small"
            style={{ color: config.accent, fontWeight: "600" }}
          >
            Active
          </Text>
        </View>

        {/* Pin toggle */}
        <Pressable
          onPress={onTogglePin}
          hitSlop={8}
          style={({ pressed }) => [
            styles.pinBtn,
            isPinned
              ? {
                  backgroundColor: `${config.accent}20`,
                  borderColor: `${config.accent}40`,
                }
              : {
                  backgroundColor: theme.muted,
                  borderColor: theme.border,
                },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text selectable style={{ fontSize: 12 }}>
            {isPinned ? "📌" : "📍"}
          </Text>
          <Text
            selectable
            variant="muted"
            style={{
              color: isPinned ? config.accent : theme.mutedForeground,
              fontWeight: "500",
              fontSize: 11,
            }}
          >
            {isPinned ? "Pinned" : `Pin (${pinnedCount}/4)`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Setup section card ─────────────────────────────────────────────────── */

function SetupSection({
  section,
  accentColor,
  settings,
  toggles,
  onToggle,
  onEdit,
  onDeactivate,
}: {
  section: SetupSectionConfig;
  accentColor: string;
  settings: DomainSettings;
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  onEdit: (row: SetupRowConfig) => void;
  onDeactivate?: () => void;
}) {
  const { theme } = useDomainTheme();
  const isDanger = section.title.toLowerCase().includes("danger");

  return (
    <View style={styles.sectionWrap}>
      <Text
        selectable
        variant="muted"
        style={[
          styles.sectionTitle,
          {
            color: isDanger
              ? theme.destructive ?? "#e24b4a"
              : theme.mutedForeground,
          },
        ]}
      >
        {section.title}
      </Text>

      <View
        style={[
          styles.sectionCard,
          {
            borderColor: isDanger
              ? `${theme.destructive}30`
              : theme.border,
          },
        ]}
      >
        {section.rows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && (
              <Separator
                style={{ marginLeft: 16 }}
              />
            )}
            <SetupRow
              row={row}
              accentColor={accentColor}
              settings={settings}
              toggles={toggles}
              onToggle={onToggle}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

/* ── Individual row ─────────────────────────────────────────────────────── */

function SetupRow({
  row,
  accentColor,
  settings,
  toggles,
  onToggle,
  onEdit,
  onDeactivate,
}: {
  row: SetupRowConfig;
  accentColor: string;
  settings: DomainSettings;
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  onEdit: (row: SetupRowConfig) => void;
  onDeactivate?: () => void;
}) {
  const { theme } = useDomainTheme();
  const right = row.right;
  const isDanger = right.type === "danger";
  const isToggle = right.type === "toggle";
  const displayValue = getRowDisplayValue(row, settings);
  const hasStoredValue =
    typeof getStoredRowValue(row, settings) === "string" &&
    (getStoredRowValue(row, settings) as string).trim().length > 0;

  function handlePress() {
    if (isDanger) {
      Alert.alert(
        row.label,
        "This will hide this domain from your activities and suggestions.",
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
      onEdit(row);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        pressed && !isToggle && { backgroundColor: `${theme.muted}80` },
      ]}
    >
      <View style={styles.rowInfo}>
        <Text
          selectable
          variant="small"
          style={[
            styles.rowLabel,
            { color: isDanger ? theme.destructive : theme.foreground },
          ]}
        >
          {row.label}
        </Text>
        <Text
          selectable
          variant="muted"
          style={{ color: theme.mutedForeground }}
        >
          {row.sub}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {right.type === "badge-todo" && (
          <Badge variant={hasStoredValue ? "outline" : "subtle"} color={hasStoredValue ? "success" : "default"}>
            {hasStoredValue ? "Set" : "Not set"}
          </Badge>
        )}
        {right.type === "badge-done" && (
          <Badge
            variant={hasStoredValue ? "outline" : "subtle"}
            color={hasStoredValue ? "success" : "default"}
          >
            {hasStoredValue ? "Set" : "Not set"}
          </Badge>
        )}
        {right.type === "toggle" && (
          <Switch
            value={toggles[right.toggleKey] ?? right.initial ?? false}
            onValueChange={(v) => onToggle(right.toggleKey, v)}
          />
        )}
        {right.type === "value" && (
          <View style={styles.valueRow}>
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              {displayValue ?? "—"}
            </Text>
            <FontAwesome
              name="angle-right"
              size={16}
              color={theme.mutedForeground}
            />
          </View>
        )}
        {right.type === "arrow" && (
          <FontAwesome
            name="angle-right"
            size={16}
            color={theme.mutedForeground}
          />
        )}
        {right.type === "danger" && (
          <FontAwesome
            name="angle-right"
            size={16}
            color={theme.destructive}
          />
        )}
      </View>
    </Pressable>
  );
}

function EditValueModal({
  visible,
  row,
  value,
  accentColor,
  onChangeValue,
  onClose,
  onSave,
}: {
  visible: boolean;
  row: SetupRowConfig | null;
  value: string;
  accentColor: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { theme } = useDomainTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text
            selectable
            variant="small"
            style={[styles.modalTitle, { color: theme.foreground }]}
          >
            {row?.label ?? "Edit setting"}
          </Text>
          <Text
            selectable
            variant="muted"
            style={[styles.modalSubtitle, { color: theme.mutedForeground }]}
          >
            {row?.sub ?? ""}
          </Text>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Enter a value"
            placeholderTextColor={theme.mutedForeground}
            style={[
              styles.modalInput,
              {
                backgroundColor: theme.muted,
                borderColor: theme.border,
                color: theme.foreground,
              },
            ]}
            autoFocus
          />

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              size="sm"
              onPress={onClose}
            />
            <Button
              title="Save"
              variant="primary"
              size="sm"
              onPress={onSave}
              style={{ backgroundColor: accentColor }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function DomainSetupScreen({ domainKey }: { domainKey: string }) {
  const { theme } = useDomainTheme();
  const config = DOMAIN_CONFIGS[domainKey];

  // Convex: read current domain status
  const domainStatus = useQuery(
    api.domains.getDomainStatus,
    domainKey ? { domain: domainKey as any } : "skip",
  );

  // All user domains — to count pinned
  const allDomains = useQuery(api.domains.getUserDomains) ?? [];
  const pinnedCount = allDomains.filter((d) => d.status === "pinned").length;

  const activate = useMutation(api.domains.activateDomain);
  const deactivate = useMutation(api.domains.deactivateDomain);
  const togglePin = useMutation(api.domains.togglePinDomain);
  const saveDomainSetting = useMutation(api.domains.saveDomainSetting);

  // Derive active state
  const isActive =
    domainStatus?.status === "active" || domainStatus?.status === "pinned";
  const isPinned = domainStatus?.status === "pinned";
  const domainSettings = (domainStatus?.settings ?? {}) as DomainSettings;

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
  const [editingRow, setEditingRow] = useState<SetupRowConfig | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    if (!config) {
      return;
    }

    const nextToggles: Record<string, boolean> = {};
    config.sections.forEach((section) =>
      section.rows.forEach((row) => {
        if (row.right.type === "toggle") {
          const stored = domainSettings[row.right.toggleKey];
          nextToggles[row.right.toggleKey] =
            typeof stored === "boolean" ? stored : (row.right.initial ?? false);
        }
      }),
    );

    setToggles(nextToggles);
  }, [config, domainSettings]);

  /* ── Not found fallback ──────────────────────────────────────────────── */

  if (!config) {
    return (
      <Container>
        <View style={styles.notFound}>
          <View style={styles.notFoundIcon}>
            <FontAwesome name="question" size={24} color={theme.mutedForeground} />
          </View>
          <Text
            selectable
            variant="body"
            style={{ color: theme.foreground, textAlign: "center" }}
          >
            Domain "{domainKey}" not found.
          </Text>
          <Button
            title="Go back"
            variant="outline"
            size="sm"
            onPress={() => router.back()}
          />
        </View>
      </Container>
    );
  }

  const accentColor = config.accent;

  /* ── Handlers ────────────────────────────────────────────────────────── */

  function handleToggle(key: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
    void saveDomainSetting({
      domain: domainKey as any,
      key,
      value,
    }).catch((error) => {
      Alert.alert(
        "Could not save setting",
        error instanceof Error ? error.message : "Please try again.",
      );
    });
  }

  function handleEdit(row: SetupRowConfig) {
    const stored = getStoredRowValue(row, domainSettings);
    setEditingRow(row);
    setEditingValue(typeof stored === "string" ? stored : "");
  }

  async function handleActivate() {
    await activate({ domain: domainKey as any });
  }

  async function handleDeactivate() {
    await deactivate({ domain: domainKey as any });
    router.back();
  }

  async function handleTogglePin() {
    const result = await togglePin({ domain: domainKey as any });
    if (!result.ok && result.error) {
      Alert.alert("Pin limit", result.error);
    }
  }

  async function handleSaveEdit() {
    if (!editingRow) {
      return;
    }

    const value = editingValue.trim();
    if (!value) {
      Alert.alert("Enter a value", `Add a value for ${editingRow.label.toLowerCase()}.`);
      return;
    }

    await saveDomainSetting({
      domain: domainKey as any,
      key: getRowSettingKey(editingRow),
      value,
    });
    setEditingRow(null);
    setEditingValue("");
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <Container>
      <TopBar title={config.name} accentColor={accentColor} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Branch: inactive vs active ────────────────────────────────── */}
        {!isActive ? (
          <InactiveHero config={config} onActivate={handleActivate} />
        ) : (
          <>
            <ActiveHero
              config={config}
              isPinned={isPinned}
              onTogglePin={handleTogglePin}
              pinnedCount={pinnedCount}
            />

            {/* Setup sections — only shown when active */}
            {config.sections.map((section) => (
              <SetupSection
                key={section.title}
                section={section}
                accentColor={accentColor}
                settings={domainSettings}
                toggles={toggles}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
              />
            ))}
          </>
        )}
      </ScrollView>

      <EditValueModal
        visible={editingRow != null}
        row={editingRow}
        value={editingValue}
        accentColor={accentColor}
        onChangeValue={setEditingValue}
        onClose={() => {
          setEditingRow(null);
          setEditingValue("");
        }}
        onSave={() => {
          void handleSaveEdit().catch((error) => {
            Alert.alert(
              "Could not save setting",
              error instanceof Error ? error.message : "Please try again.",
            );
          });
        }}
      />
    </Container>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /* Not found */
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  notFoundIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(128,128,128,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Scroll */
  scroll: {
    paddingBottom: 96,
  },

  /* ── Top bar ──────────────────────────────────────────────────────── */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
    textAlign: "center",
  },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
  },
  doneBtnText: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 13,
  },
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    width: "100%",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.xl,
    gap: UI_PRESETS.spacing.lg,
  },
  modalTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 16,
  },
  modalSubtitle: {
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    minHeight: 48,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.md,
    fontFamily: "Figtree",
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: UI_PRESETS.spacing.md,
  },

  /* ── Inactive hero ────────────────────────────────────────────────── */
  inactiveHero: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: 32,
    gap: 12,
    alignItems: "center",
  },
  heroIconLg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroEmojiLg: {
    fontSize: 32,
    lineHeight: 38,
  },
  heroName: {
    fontFamily: "Geist",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  heroDesc: {
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
  },

  /* Status pill */
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  /* Activation CTA card */
  activateCta: {
    width: "100%",
    borderRadius: UI_PRESETS.radius.xxl,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 20,
    gap: 16,
    marginTop: 8,
  },
  activateCtaBody: {
    gap: 4,
  },
  activateCtaTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 15,
  },

  /* Locked preview */
  lockedPreview: {
    width: "100%",
    gap: 6,
    marginTop: 8,
    opacity: 0.5,
  },
  lockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  lockedTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: UI_PRESETS.radius.md,
    borderWidth: 1,
  },

  /* ── Active hero ──────────────────────────────────────────────────── */
  activeHero: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: 20,
    gap: 16,
  },
  activeHeroTop: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  heroIconSm: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmojiSm: {
    fontSize: 22,
    lineHeight: 26,
  },
  activeHeroInfo: {
    flex: 1,
    gap: 3,
  },
  heroNameSm: {
    fontFamily: "Geist",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    letterSpacing: -0.2,
  },

  /* Active status row */
  activeStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusPillActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },

  /* ── Setup sections ───────────────────────────────────────────────── */
  sectionWrap: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: 24,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },

  /* ── Row ───────────────────────────────────────────────────────────── */
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: "Geist",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
