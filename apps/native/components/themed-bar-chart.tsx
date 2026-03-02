import React, { useMemo } from "react";
import { View, ViewStyle } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { AnimationTokens, NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type BarPoint = {
   label: string;
   value: number;
};

interface ThemedBarChartProps {
   data: BarPoint[];
   highlightedIndex?: number;
   height?: number;
   barWidth?: number;
   spacing?: number;
   animateOnMount?: boolean;
   style?: ViewStyle;
}

export function ThemedBarChart(props: ThemedBarChartProps) {
   const {
      data,
      highlightedIndex = -1,
      height = 120,
      barWidth = 38,
      spacing = 8,
      animateOnMount = true,
      style,
   } = props;
   const { colorScheme } = useColorScheme();
   const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
   const isDark = colorScheme === "dark";

   const chartData = useMemo(
      () =>
         data.map((point, index) => {
            const isActive = index === highlightedIndex;
            const activeColor = isDark ? "#6f7178" : "#8f9197";
            const inactiveColor = isDark ? "#313238" : "#e8e8ea";
            return {
               value: point.value,
               label: point.label,
               frontColor: isActive ? activeColor : inactiveColor,
               labelTextStyle: {
                  color: isActive ? theme.foreground : theme.mutedForeground,
                  fontSize: 13,
                  fontFamily: "Geist",
                  fontWeight: "500" as const,
               },
            };
         }),
      [data, highlightedIndex, isDark, theme.foreground, theme.mutedForeground],
   );

   return (
      <View style={style}>
         <BarChart
            data={chartData}
            barWidth={barWidth}
            spacing={spacing}
            roundedTop={false}
            roundedBottom={false}
            barBorderRadius={10}
            hideRules={false}
            rulesColor={isDark ? "hsla(0, 0%, 100%, 0.08)" : "hsla(228, 14%, 52%, 0.15)"}
            rulesThickness={1}
            yAxisThickness={0}
            hideYAxisText
            yAxisLabelWidth={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={undefined}
            noOfSections={3}
            maxValue={Math.max(...data.map((item) => item.value), 1)}
            height={height}
            initialSpacing={0}
            endSpacing={0}
            isAnimated={animateOnMount}
            animationDuration={AnimationTokens.duration.slow}
         />
      </View>
   );
}
