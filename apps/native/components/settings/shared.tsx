import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { Avatar, Badge, Button, Card, Separator, Surface, Switch, Text } from "@/components/ui";
import type {
  DomainItem,
  SettingsRowItem,
} from "@/components/settings/data";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function showSettingsPreview(title: string, message: string) {
  Alert.alert(title, message);
}

export function useSettingsTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return { theme, isDarkColorScheme };
}

export function SettingsScroll({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  );
}

export function ProfileHero({
  name,
  subtitle,
  image,
  metrics,
}: {
  name: string;
  subtitle: string;
  image?: string;
  metrics: ReadonlyArray<{ label: string; value: string; color: string }>;
}) {
  const { theme, isDarkColorScheme } = useSettingsTheme();

  return (
    <View style={styles.heroWrap}>
      <View
        pointerEvents="none"
        style={[
          styles.heroGlow,
          styles.heroGlowRight,
          {
            backgroundColor: isDarkColorScheme
              ? "rgba(155, 143, 255, 0.12)"
              : "rgba(91, 80, 214, 0.12)",
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.heroGlow,
          styles.heroGlowLeft,
          {
            backgroundColor: isDarkColorScheme
              ? "rgba(31, 169, 127, 0.08)"
              : "rgba(31, 169, 127, 0.1)",
          },
        ]}
      />

      <Surface elevation="md" tone="card" style={styles.identitySurface}>
        <View style={styles.identityHeader}>
          <Badge variant="subtle" color="primary">
            Life OS profile
          </Badge>
          <Pressable
            onPress={() =>
              showSettingsPreview(
                "Edit profile",
                "Profile editing can hang off this hero once the account settings form is ready.",
              )
            }
          >
            <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
              Edit
            </Text>
          </Pressable>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatarHalo}>
            <Avatar
              source={image ? { uri: image } : undefined}
              fallback={name}
              size="lg"
            />
          </View>
          <View style={styles.identityBody}>
            <Text selectable variant="h3" style={styles.identityName}>
              {name}
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {subtitle}
            </Text>
          </View>
        </View>
      </Surface>

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <Card key={metric.label} style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text selectable style={[styles.metricValue, { color: metric.color }]}>
              {metric.value}
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              {metric.label}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { theme } = useSettingsTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text selectable variant="muted" style={[styles.sectionEyebrow, { color: theme.mutedForeground }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SettingsGroup({
  children,
}: {
  children: ReactNode;
}) {
  const { theme } = useSettingsTheme();

  return (
    <Card style={[styles.groupCard, { borderColor: theme.border }]}>
      {children}
    </Card>
  );
}

export function SettingsRow({
  item,
  toggleValue,
  onPress,
}: {
  item: SettingsRowItem;
  toggleValue?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useSettingsTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: item.iconBackgroundColor },
        ]}
      >
        <FontAwesome name={item.icon} size={14} color={item.iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text selectable variant="small" style={[styles.rowTitle, { color: theme.foreground }]}>
          {item.title}
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.rowTrailing}>
        {item.toggleKey ? (
          <Switch value={Boolean(toggleValue)} onValueChange={() => onPress?.()} />
        ) : item.value ? (
          <>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {item.value}
            </Text>
            <FontAwesome name="angle-right" size={16} color={theme.mutedForeground} />
          </>
        ) : (
          <FontAwesome name="angle-right" size={16} color={theme.mutedForeground} />
        )}
      </View>
    </Pressable>
  );
}

export function SettingsSeparator() {
  return <Separator style={styles.separator} />;
}

export function DomainOrderList({ items }: { items: readonly DomainItem[] }) {
  const { theme } = useSettingsTheme();

  return (
    <View style={styles.domainList}>
      {items.map((item) => (
        <Card
          key={item.id}
          style={[
            styles.domainCard,
            {
              backgroundColor:
                item.status === "pinned" ? "#1a1628" : theme.card,
              borderColor:
                item.status === "pinned" ? "#3d3570" : theme.border,
              opacity: item.status === "inactive" ? 0.55 : 1,
            },
          ]}
        >
          <View style={styles.domainHandle}>
            <View style={styles.domainHandleBar} />
            <View style={styles.domainHandleBar} />
            <View style={styles.domainHandleBar} />
          </View>
          <View
            style={[styles.domainAccent, { backgroundColor: item.accentColor }]}
          />
          <Text selectable variant="small" style={[styles.domainName, { color: theme.foreground }]}>
            {item.label}
          </Text>
          {item.status === "pinned" ? (
            <Text selectable variant="muted" style={{ color: item.accentColor }}>
              Pinned
            </Text>
          ) : item.status === "active" ? (
            <View
              style={[
                styles.domainStatusDot,
                { backgroundColor: item.accentColor },
              ]}
            />
          ) : (
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              Inactive
            </Text>
          )}
        </Card>
      ))}
    </View>
  );
}

export function MemoryCard({
  stats,
  onViewPress,
}: {
  stats: ReadonlyArray<{ label: string; value: string }>;
  onViewPress?: () => void;
}) {
  return (
    <Card style={styles.memoryCard}>
      <View style={styles.memoryHeader}>
        <View style={styles.memoryPulse} />
        <Text selectable variant="muted" style={styles.memoryLabel}>
          Context layer
        </Text>
      </View>
      <Text selectable variant="small" style={styles.memoryDescription}>
        Your `userContext` rows are the pre-aggregated summaries the AI reads
        before it generates anything. They update through cron jobs, not by the
        model directly.
      </Text>
      <View style={styles.memoryStats}>
        {stats.map((stat) => (
          <Card key={stat.label} style={styles.memoryStatCard}>
            <Text selectable variant="small" style={styles.memoryStatValue}>
              {stat.value}
            </Text>
            <Text selectable variant="muted" style={styles.memoryStatLabel}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>
      <View style={styles.memoryActions}>
        <Button
          title="View my context"
          variant="outline"
          onPress={onViewPress}
          style={styles.memoryButton}
        />
        <Button
          title="Clear context"
          variant="ghost"
          onPress={() =>
            showSettingsPreview(
              "Clear context",
              "This should explain the reset path before anything destructive happens.",
            )
          }
          style={styles.memoryDangerButton}
        />
      </View>
    </Card>
  );
}

export function CronCard({
  rows,
}: {
  rows: ReadonlyArray<{
    id: string;
    label: string;
    subtitle: string;
    time: string;
    color: string;
  }>;
}) {
  const { theme } = useSettingsTheme();

  return (
    <Card style={[styles.cronCard, { borderColor: theme.border }]}>
      {rows.map((row, index) => (
        <View key={row.id}>
          <View style={styles.cronRow}>
            <View style={styles.cronBody}>
              <Text selectable variant="small" style={[styles.rowTitle, { color: theme.foreground }]}>
                {row.label}
              </Text>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                {row.subtitle}
              </Text>
            </View>
            <View style={styles.cronMeta}>
              <Text selectable variant="muted" style={styles.cronTime}>
                {row.time}
              </Text>
              <View
                style={[styles.cronDot, { backgroundColor: row.color }]}
              />
            </View>
          </View>
          {index < rows.length - 1 ? <SettingsSeparator /> : null}
        </View>
      ))}
    </Card>
  );
}

export function DangerActions({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.dangerZone}>
      <Button title="Sign out" variant="destructive" onPress={onSignOut} />
      <Button
        title="Delete workspace"
        variant="ghost"
        onPress={() =>
          showSettingsPreview(
            "Delete workspace",
            "Workspace deletion needs a dedicated confirmation flow before it becomes live.",
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cronBody: {
    flex: 1,
    gap: 2,
  },
  cronCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
  },
  cronDot: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  cronMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  cronRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  cronTime: {
    fontFamily: "Geist-Medium",
  },
  dangerZone: {
    gap: 10,
  },
  domainAccent: {
    borderRadius: 999,
    height: 20,
    width: 4,
  },
  domainCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  domainHandle: {
    gap: 3,
  },
  domainHandleBar: {
    backgroundColor: "#7a7a84",
    borderRadius: 1,
    height: 2,
    width: 14,
  },
  domainList: {
    gap: 6,
  },
  domainName: {
    flex: 1,
    fontFamily: "Geist",
    fontWeight: "700",
  },
  domainStatusDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  groupCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 0,
  },
  heroGlow: {
    borderRadius: 999,
    height: 220,
    position: "absolute",
    width: 220,
  },
  heroGlowLeft: {
    left: -80,
    top: 170,
  },
  heroGlowRight: {
    right: -72,
    top: -48,
  },
  heroWrap: {
    gap: 12,
  },
  avatarHalo: {
    backgroundColor: "rgba(155, 143, 255, 0.18)",
    borderRadius: 999,
    padding: 4,
  },
  identityBody: {
    flex: 1,
    gap: 4,
  },
  identityHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  identityName: {
    fontWeight: "700",
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  identitySurface: {
    borderCurve: "continuous",
    borderRadius: 28,
    gap: 16,
  },
  memoryActions: {
    flexDirection: "row",
    gap: 10,
  },
  memoryButton: {
    flex: 1,
  },
  memoryCard: {
    backgroundColor: "#13131f",
    borderColor: "#2d2a40",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  memoryDangerButton: {
    borderColor: "#3a1a1a",
    borderWidth: 1,
    flex: 1,
  },
  memoryDescription: {
    color: "#8e8ea6",
    lineHeight: 20,
  },
  memoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  memoryLabel: {
    color: "#9b8fff",
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  memoryPulse: {
    backgroundColor: "#9b8fff",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  memoryStatCard: {
    backgroundColor: "#1a1a24",
    borderCurve: "continuous",
    borderRadius: 10,
    flex: 1,
    gap: 4,
    minWidth: 72,
    padding: 10,
  },
  memoryStatLabel: {
    color: "#66667b",
    textAlign: "center",
  },
  memoryStatValue: {
    color: "#e0e0ec",
    fontFamily: "Geist",
    fontWeight: "700",
    textAlign: "center",
  },
  memoryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 72,
    padding: 12,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricValue: {
    fontFamily: "Geist",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  rowTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  rowTrailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  scrollContent: {
    gap: UI_PRESETS.spacing.section,
    paddingBottom: 48,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.xl,
  },
  sectionEyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionHeader: {
    gap: 8,
  },
  separator: {
    opacity: 0.6,
  },
});
