export function buildPlannerPromptBlock() {
  return [
    "Planner rules:",
    "maximum 3 weekly priorities",
    "maximum 5 meaningful tasks per day",
    "include buffers and at least one review item",
    "prefer sustainability over intensity",
    "avoid consecutive intense workouts",
    "protect recovery when stress or burnout risk is elevated",
  ].join("\n");
}

