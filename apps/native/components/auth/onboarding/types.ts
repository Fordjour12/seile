export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PrimaryGoal = "productivity" | "wellbeing" | "habits" | "health";
export type EnergyPattern = "morning" | "afternoon" | "evening" | "variable";
export type BiggestBlocker =
  | "follow_through"
  | "distraction"
  | "overwhelm"
  | "energy";
export type PreferredStyle = "gentle" | "direct" | "structured";
export type CommitmentLevel = "light" | "moderate" | "committed";

export type OnboardingQuestionKey =
  | "primaryGoal"
  | "energyPattern"
  | "biggestBlocker"
  | "preferredStyle"
  | "commitmentLevel";

export type OnboardingDraftAnswers = {
  primaryGoal: PrimaryGoal;
  energyPattern: EnergyPattern;
  biggestBlocker: BiggestBlocker;
  preferredStyle: PreferredStyle;
  commitmentLevel: CommitmentLevel;
};
