import { NAV_THEME } from "@/lib/constants";

type Theme = typeof NAV_THEME.light;

export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("hsl(")) {
    return color.replace("hsl(", "hsla(").replace(")", `, ${alpha})`);
  }

  return color;
}

export function getSchedulerPriorityColor(
  theme: Theme,
  priority: "low" | "medium" | "high",
): string {
  if (priority === "high") {
    return theme.destructive;
  }

  if (priority === "medium") {
    return theme.chart4;
  }

  return theme.chart2;
}

export function getSchedulerStatusColor(
  theme: Theme,
  status: "todo" | "in_progress" | "done" | "overdue",
): string {
  if (status === "done") {
    return theme.chart2;
  }

  if (status === "in_progress") {
    return theme.primary;
  }

  if (status === "overdue") {
    return theme.destructive;
  }

  return theme.mutedForeground;
}
