import { StyleSheet, View } from "react-native";

import { Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function AuthWordmark() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={styles.wordmarkRow}>
      <View style={styles.wordmarkIcon}>
        <View style={styles.wordmarkGrid}>
          <View
            style={[
              styles.wordmarkCell,
              { backgroundColor: "#9b8fff", opacity: 0.9 },
            ]}
          />
          <View
            style={[
              styles.wordmarkCell,
              { backgroundColor: "#9b8fff", opacity: 0.55 },
            ]}
          />
          <View
            style={[
              styles.wordmarkCell,
              { backgroundColor: "#9b8fff", opacity: 0.55 },
            ]}
          />
          <View
            style={[
              styles.wordmarkCell,
              { backgroundColor: "#9b8fff", opacity: 0.3 },
            ]}
          />
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <Text
          selectable
          style={{
            color: theme.foreground,
            fontFamily: "Geist",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          Life OS
        </Text>
        <Text
          selectable
          variant="muted"
          style={{ color: theme.mutedForeground }}
        >
          Your personal operating system
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdropOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  backdropOrbTop: {
    width: 220,
    height: 220,
    top: -40,
    right: -40,
  },
  backdropOrbBottom: {
    width: 260,
    height: 260,
    bottom: 90,
    left: -90,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.section,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xl,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1e1a30",
    borderWidth: 1,
    borderColor: "#3d3570",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmarkGrid: {
    width: 22,
    height: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  wordmarkCell: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  meterRow: {
    flexDirection: "row",
    gap: 4,
  },
  meterBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
});
