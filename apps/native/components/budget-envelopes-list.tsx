import React from "react";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Pressable, StyleSheet, ViewProps } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing,
} from "react-native-reanimated";
import { Typography, CardTokens, UI_PRESETS, NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { interpolateColor, withAlpha } from "@/lib/budget-colors";

export interface BudgetEnvelope {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon?: string;
}

interface BudgetEnvelopesListProps extends ViewProps {
  envelopes: BudgetEnvelope[];
}

export function BudgetEnvelopesList({
  envelopes,
  style,
  ...props
}: BudgetEnvelopesListProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const budgetColors = {
    green: theme.chart2,
    yellow: theme.chart4,
    orange: theme.chart4,
    red: theme.destructive,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {envelopes.map((envelope) => {
        const progress = envelope.budgeted > 0 ? (envelope.spent / envelope.budgeted) : 0;
        const isOverBudget = progress > 1;
        const progressColor = interpolateColor(progress, budgetColors);

        return (
          <Pressable
            key={envelope.id}
            style={({ pressed }) => [
              styles.envelopeCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              pressed && { opacity: UI_PRESETS.opacity.pressed },
            ]}
          >
            <View style={styles.envelopeHeader}>
                <View style={styles.envelopeInfo}>
                <View style={[styles.iconContainer, { backgroundColor: withAlpha(progressColor, 0.12) }]}>
                  <Text style={[styles.iconText, { color: progressColor }]}>
                    {envelope.icon || envelope.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[Typography.titleSM, { color: theme.text }]}>
                  {envelope.name}
                </Text>
              </View>
              <Text
                style={[
                  Typography.labelSM,
                  { color: isOverBudget ? theme.destructive : theme.mutedForeground },
                ]}
              >
                GH₵{envelope.spent.toFixed(2)} / GH₵{envelope.budgeted.toFixed(2)}
              </Text>
            </View>

            <AnimatedProgress 
              progress={progress} 
              progressColor={progressColor}
              theme={theme}
            />

            <View style={styles.footerRow}>
              <Text
                style={[
                  Typography.captionSM,
                  { color: theme.mutedForeground },
                ]}
              >
                {isOverBudget 
                  ? `GH₵${(envelope.spent - envelope.budgeted).toFixed(2)} over budget`
                  : `GH₵${(envelope.budgeted - envelope.spent).toFixed(2)} remaining`
                }
              </Text>
              <Text
                style={[
                  Typography.captionSM,
                  { color: progressColor },
                ]}
              >
                {isOverBudget ? "Over budget" : `${Math.round(progress * 100)}% utilized`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function AnimatedProgress({ 
  progress, 
  progressColor,
  theme 
}: { 
  progress: number; 
  progressColor: string;
  theme: any;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${Math.min(progress * 100, 100)}%`, {
        duration: 500,
        easing: Easing.bezier(0.2, 0, 0, 1),
      }),
    };
  }, [progress]);

  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressBar,
          { backgroundColor: theme.muted },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            animatedStyle,
            { backgroundColor: progressColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.sm,
  },
  envelopeCard: {
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.md,
    paddingTop: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.sm,
    minHeight: 90,
  },
  envelopeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  envelopeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 6,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
});
