import type { ComponentProps } from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";

export type SettingsToggleKey =
  | "proactiveSuggestions"
  | "approvalRequired"
  | "morningBriefing"
  | "approvalAlerts"
  | "habitReminders";

export type DomainItem = {
  id: string;
  label: string;
  accentColor: string;
  status: "active" | "inactive" | "pinned";
};

export type SettingsRowItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackgroundColor: string;
  value?: string;
  toggleKey?: SettingsToggleKey;
};

export const SETTINGS_METRICS = [
  { label: "Day streak", value: "47", color: "#9b8fff" },
  { label: "Avg completion", value: "68%", color: "#1d9e75" },
  { label: "Faith streak", value: "5", color: "#b4adf5" },
  { label: "Domains active", value: "8", color: "#ba7517" },
] as const;

export const AI_BEHAVIOR_ROWS: SettingsRowItem[] = [
  {
    id: "planning-style",
    title: "Planning style",
    subtitle: "How the AI structures your week",
    value: "Balanced",
    icon: "sliders",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
  {
    id: "ai-tone",
    title: "AI tone",
    subtitle: "How the AI communicates with you",
    value: "Direct",
    icon: "comment-o",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
  {
    id: "proactive-suggestions",
    title: "Proactive suggestions",
    subtitle: "AI surfaces insights without being asked",
    toggleKey: "proactiveSuggestions",
    icon: "lightbulb-o",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
  {
    id: "approval-required",
    title: "Approval required for all changes",
    subtitle: "AI never writes to your plan without asking",
    toggleKey: "approvalRequired",
    icon: "shield",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
  {
    id: "insight-cadence",
    title: "Insight refresh cadence",
    subtitle: "How often cron jobs regenerate your context",
    value: "Daily · 6 AM",
    icon: "clock-o",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
];

export const NOTIFICATION_ROWS: SettingsRowItem[] = [
  {
    id: "morning-briefing",
    title: "Morning briefing",
    subtitle: "Today screen summary on wake-up",
    toggleKey: "morningBriefing",
    icon: "sun-o",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
  {
    id: "approval-alerts",
    title: "Approval alerts",
    subtitle: "Notify when AI proposes plan changes",
    toggleKey: "approvalAlerts",
    icon: "bell-o",
    iconColor: "#ba7517",
    iconBackgroundColor: "#1a1408",
  },
  {
    id: "habit-reminders",
    title: "Habit reminders",
    subtitle: "Prompt for habits you still have open",
    toggleKey: "habitReminders",
    icon: "check-circle-o",
    iconColor: "#ed93b1",
    iconBackgroundColor: "#2a1020",
  },
  {
    id: "notification-timing",
    title: "Notification timing",
    subtitle: "Morning, evening, and weekly review times",
    value: "Open",
    icon: "clock-o",
    iconColor: "#9b8fff",
    iconBackgroundColor: "#1e1a30",
  },
];

export const DOMAIN_ITEMS: DomainItem[] = [
  { id: "faith", label: "Faith", accentColor: "#534AB7", status: "pinned" },
  { id: "career", label: "Career", accentColor: "#185FA5", status: "active" },
  { id: "finance", label: "Finance", accentColor: "#0F6E56", status: "active" },
  { id: "health", label: "Health", accentColor: "#993C1D", status: "active" },
  { id: "wellness", label: "Wellness", accentColor: "#993556", status: "active" },
  { id: "tasks", label: "Tasks", accentColor: "#5F5E5A", status: "active" },
  {
    id: "relationships",
    label: "Relationships",
    accentColor: "#444444",
    status: "inactive",
  },
  { id: "space", label: "Space", accentColor: "#444444", status: "inactive" },
] as const;

export const MEMORY_STATS = [
  { label: "Tables", value: "53" },
  { label: "Cron jobs", value: "24" },
  { label: "Timezone", value: "UTC" },
  { label: "Daily sync", value: "6 AM" },
] as const;

export const CRON_ROWS = [
  {
    id: "context",
    label: "Daily context sync",
    subtitle: "Aggregates all domain data",
    time: "06:00 UTC",
    color: "#1d9e75",
  },
  {
    id: "insights",
    label: "Insight refresh",
    subtitle: "Generates AI suggestions",
    time: "06:15 UTC",
    color: "#1d9e75",
  },
  {
    id: "streaks",
    label: "Habit streak calc",
    subtitle: "Updates streaks and completions",
    time: "23:55 UTC",
    color: "#88889a",
  },
  {
    id: "review",
    label: "Weekly review prep",
    subtitle: "Generates Friday review data",
    time: "Fri 20:00 UTC",
    color: "#ba7517",
  },
] as const;
