import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"] as const;
const VALUES = [58, 30, 66, 54, 84, 52, 65, 59] as const;
const ACTIVE_INDEX = 4;

function StripeFill({ active }: { active?: boolean }) {
   return (
      <View pointerEvents="none" style={styles.stripeContainer}>
         {Array.from({ length: 7 }).map((_, i) => (
            <View
               key={i}
               style={[
                  styles.stripe,
                  {
                     backgroundColor: active ? "rgba(255,255,255,0.22)" : "rgba(110,110,110,0.09)",
                     top: i * 9 - 8,
                  },
               ]}
            />
         ))}
      </View>
   );
}

interface OverviewChartCardProps extends ViewProps {
   title?: string;
   periodLabel?: string;
   avgLabel?: string;
   totalLabel?: string;
   growthLabel?: string;
   tooltipMonth?: string;
   tooltipValue?: string;
}

export function OverviewChartCard1({
   title = "Overview",
   periodLabel = "Last Month",
   avgLabel = "Avg Per month",
   totalLabel = "1,860/3K",
   growthLabel = "50,2%",
   tooltipMonth = "August 2025",
   tooltipValue = "120 pcs",
   style,
   ...props
}: OverviewChartCardProps) {
   const { colorScheme } = useColorScheme();
   const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
   const isDark = colorScheme === "dark";

   return (
      <View
         style={[
            styles.card,
            {
               backgroundColor: isDark ? theme.card : "#f2f2f3",
               borderColor: isDark ? theme.border : "#e7e7ea",
            },
            style,
         ]}
         {...props}
      >
         <View style={styles.topRow}>
            <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
            <View
               style={[
                  styles.periodPill,
                  {
                     backgroundColor: isDark ? theme.background : "#efeff1",
                     borderColor: isDark ? theme.border : "#dedee3",
                  },
               ]}
            >
               <Text style={[styles.periodText, { color: theme.mutedForeground }]}>{periodLabel}</Text>
               <Text style={[styles.periodChevron, { color: theme.mutedForeground }]}>⌄</Text>
            </View>
         </View>

         <View style={styles.metricWrap}>
            <Text style={[styles.metricLabel, { color: theme.mutedForeground }]}>{avgLabel}</Text>
            <View style={styles.metricRow}>
               <Text style={[styles.metricValue, { color: theme.foreground }]}>{totalLabel}</Text>
               <View
                  style={[
                     styles.growthPill,
                     { backgroundColor: isDark ? "rgba(65, 210, 155, 0.18)" : "#d6f3e5" },
                  ]}
               >
                  <Text style={[styles.growthText, { color: "#15a36f" }]}>{growthLabel}</Text>
                  <Text style={styles.growthArrow}>▲</Text>
               </View>
            </View>
         </View>

         <View style={[styles.chartWrap, { borderTopColor: isDark ? theme.border : "#e2e2e6" }]}>
            <View
               style={[
                  styles.tooltip,
                  {
                     left: 34 * ACTIVE_INDEX + 22,
                     backgroundColor: isDark ? "#232326" : "#2f2f33",
                  },
               ]}
            >
               <Text style={styles.tooltipMonth}>{tooltipMonth}</Text>
               <Text style={styles.tooltipValue}>{tooltipValue}</Text>
               <View
                  style={[
                     styles.tooltipPin,
                     {
                        borderColor: isDark ? "#8f8f95" : "#f1f1f3",
                        backgroundColor: isDark ? "#232326" : "#2f2f33",
                     },
                  ]}
               />
               <View style={[styles.tooltipArrow, { borderTopColor: isDark ? "#232326" : "#2f2f33" }]} />
            </View>

            <View style={styles.barsRow}>
               {MONTHS.map((month, i) => {
                  const active = i === ACTIVE_INDEX;
                  return (
                     <View key={month} style={styles.column}>
                        <View
                           style={[
                              styles.bar,
                              {
                                 height: VALUES[i],
                                 backgroundColor: active ? (isDark ? "#6f7178" : "#8f9197") : (isDark ? "#313238" : "#e8e8ea"),
                                 borderColor: active ? (isDark ? "#858892" : "#63656b") : (isDark ? "#474950" : "#d8d8dc"),
                              },
                           ]}
                        >
                           <StripeFill active={active} />
                        </View>
                        <Text style={[styles.month, { color: active ? theme.foreground : theme.mutedForeground }]}>
                           {month}
                        </Text>
                     </View>
                  );
               })}
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   card: {
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.08)",
   },
   topRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
   },
   title: {
      fontFamily: "Geist",
      fontSize: 34 / 2,
      fontWeight: "700",
      lineHeight: 24,
   },
   periodPill: {
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1,
      flexDirection: "row",
      gap: 6,
      minHeight: 34,
      paddingHorizontal: 10,
   },
   periodText: {
      fontFamily: "Geist",
      fontSize: 12,
      fontWeight: "500",
   },
   periodChevron: {
      fontSize: 12,
      marginTop: -2,
   },
   metricWrap: {
      marginTop: 10,
   },
   metricLabel: {
      fontFamily: "Geist",
      fontSize: 14,
      lineHeight: 20,
   },
   metricRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      marginTop: 2,
   },
   metricValue: {
      fontFamily: "Geist",
      fontSize: 40 / 2,
      fontWeight: "700",
      lineHeight: 28,
   },
   growthPill: {
      alignItems: "center",
      borderRadius: 7,
      flexDirection: "row",
      gap: 4,
      marginTop: 2,
      minHeight: 20,
      paddingHorizontal: 7,
   },
   growthText: {
      fontFamily: "Geist",
      fontSize: 11,
      fontWeight: "700",
   },
   growthArrow: {
      color: "#15a36f",
      fontSize: 9,
      marginTop: -1,
   },
   chartWrap: {
      borderTopWidth: 1,
      marginTop: 12,
      paddingTop: 36,
      position: "relative",
   },
   tooltip: {
      alignItems: "center",
      borderRadius: 12,
      minWidth: 86,
      paddingHorizontal: 8,
      paddingVertical: 6,
      position: "absolute",
      top: -38,
      zIndex: 5,
   },
   tooltipMonth: {
      color: "#d4d5da",
      fontFamily: "Geist",
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 14,
   },
   tooltipValue: {
      color: "#ffffff",
      fontFamily: "Geist",
      fontSize: 27 / 2,
      fontWeight: "700",
      lineHeight: 18,
      marginTop: 2,
   },
   tooltipArrow: {
      borderLeftColor: "transparent",
      borderLeftWidth: 7,
      borderRightColor: "transparent",
      borderRightWidth: 7,
      borderTopWidth: 8,
      bottom: -8,
      height: 0,
      position: "absolute",
      width: 0,
   },
   tooltipPin: {
      borderRadius: 7,
      borderWidth: 2,
      bottom: -30,
      height: 12,
      position: "absolute",
      width: 12,
   },
   barsRow: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: 8,
      minHeight: 120,
   },
   column: {
      alignItems: "center",
      flex: 1,
      gap: 8,
   },
   bar: {
      borderRadius: 9,
      borderWidth: 1,
      overflow: "hidden",
      position: "relative",
      width: "100%",
   },
   stripeContainer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
   },
   stripe: {
      height: 2,
      left: -12,
      position: "absolute",
      transform: [{ rotate: "-22deg" }],
      width: 54,
   },
   month: {
      fontFamily: "Geist",
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 17,
   },
});
