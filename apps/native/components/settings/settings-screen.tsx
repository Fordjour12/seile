import { Fragment, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { Container } from "@/components/container";
import {
  AI_BEHAVIOR_ROWS,
  CRON_ROWS,
  DOMAIN_ITEMS,
  MEMORY_STATS,
  NOTIFICATION_ROWS,
  SETTINGS_METRICS,
  type SettingsToggleKey,
} from "@/components/settings/data";
import {
  CronCard,
  DangerActions,
  DomainOrderList,
  MemoryCard,
  ProfileHero,
  SectionHeader,
  SettingsGroup,
  SettingsRow,
  SettingsScroll,
  SettingsSeparator,
  showSettingsPreview,
} from "@/components/settings/shared";
import { useAuth } from "@/lib/v1-auth-context";

const INITIAL_TOGGLES: Record<SettingsToggleKey, boolean> = {
  proactiveSuggestions: true,
  approvalRequired: true,
  morningBriefing: true,
  approvalAlerts: true,
  habitReminders: false,
};

export function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  const displayName = user?.name?.trim() || "Bobie";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const identityLine = [
    user?.email?.trim() || "Life OS workspace",
    "Active since Jan 2026",
    timezone,
  ].join(" · ");

  function toggleValue(key: SettingsToggleKey) {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleSignOut() {
    Alert.alert(
      "Sign out?",
      "You can sign back in anytime with your current account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ],
    );
  }

  return (
    <Container>
      <SettingsScroll>
        <ProfileHero
          name={displayName}
          subtitle={identityLine}
          image={user?.image}
          metrics={SETTINGS_METRICS}
        />

        <SectionHeader title="AI behavior" />
        <SettingsGroup>
          {AI_BEHAVIOR_ROWS.map((row, index) => (
            <Fragment key={row.id}>
              <SettingsRow
                item={row}
                toggleValue={row.toggleKey ? toggles[row.toggleKey] : undefined}
                onPress={() => {
                  if (row.toggleKey) {
                    toggleValue(row.toggleKey);
                    return;
                  }

                  if (row.id === "planning-style") {
                    router.push("/(tabs)/settings/planning-style");
                    return;
                  }
                  if (row.id === "ai-tone") {
                    router.push("/(tabs)/settings/ai-tone");
                    return;
                  }
                  if (row.id === "insight-cadence") {
                    router.push("/(tabs)/settings/timezone-sync");
                    return;
                  }
                  showSettingsPreview(row.title, row.subtitle);
                }}
              />
              {index < AI_BEHAVIOR_ROWS.length - 1 ? <SettingsSeparator /> : null}
            </Fragment>
          ))}
        </SettingsGroup>

        <SectionHeader title="Notifications" />
        <SettingsGroup>
          {NOTIFICATION_ROWS.map((row, index) => (
            <Fragment key={row.id}>
              <SettingsRow
                item={row}
                toggleValue={row.toggleKey ? toggles[row.toggleKey] : undefined}
                onPress={() => {
                  if (row.toggleKey) {
                    toggleValue(row.toggleKey);
                    return;
                  }

                  if (row.id === "notification-timing") {
                    router.push("/(tabs)/settings/notification-timing");
                    return;
                  }
                  showSettingsPreview(row.title, row.subtitle);
                }}
              />
              {index < NOTIFICATION_ROWS.length - 1 ? <SettingsSeparator /> : null}
            </Fragment>
          ))}
        </SettingsGroup>

        <SectionHeader
          title="Domain order"
          subtitle="Drag-and-drop can come later. The visual ordering and status states are in place now."
        />
        <DomainOrderList items={DOMAIN_ITEMS} />

        <SectionHeader title="AI memory" />
        <MemoryCard
          stats={MEMORY_STATS}
          onViewPress={() => router.push("/(tabs)/settings/memory-viewer")}
        />

        <SectionHeader title="Cron health" />
        <CronCard rows={CRON_ROWS} />

        <SectionHeader title="Danger zone" />
        <DangerActions onSignOut={handleSignOut} />
      </SettingsScroll>
    </Container>
  );
}
