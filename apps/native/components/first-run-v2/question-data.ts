// ─── Alternative Question Formats for Daily Prompts ─────────────────────────

// ─── VARIATION 1: Concise Question Format ───────────────────────────────────
// Shorter, more direct questions that get straight to the point

export type ConciseQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  primary: string; // Main question
  secondary?: string; // Follow-up or context
  responseTime?: string; // Estimated answer time
};

export const CONCISE_QUESTIONS: ConciseQuestion[] = [
  {
    day: 1,
    phase: "seed",
    primary: "How are you feeling today?",
    secondary: "Rate your mood, energy, and focus on a scale of 1-10",
    responseTime: "2 min",
  },
  {
    day: 2,
    phase: "seed",
    primary: "What worked yesterday?",
    secondary: "What made day 1 feel successful?",
    responseTime: "3 min",
  },
  {
    day: 3,
    phase: "learn",
    primary: "What's your energy pattern?",
    secondary: "When do you feel strongest?",
    responseTime: "2 min",
  },
  {
    day: 4,
    phase: "learn",
    primary: "What's blocking you most?",
    secondary: "One thing getting in your way",
    responseTime: "3 min",
  },
  {
    day: 5,
    phase: "learn",
    primary: "How's your momentum?",
    secondary: "Are you building sustainable habits?",
    responseTime: "2 min",
  },
  {
    day: 6,
    phase: "act",
    primary: "Ready for a challenge?",
    secondary: "Push just a bit further today",
    responseTime: "1 min",
  },
  {
    day: 7,
    phase: "act",
    primary: "Reflect on your week",
    secondary: "What have you learned about yourself?",
    responseTime: "5 min",
  },
];

// ─── VARIATION 2: Multi-Choice Question Format ───────────────────────────────
// Structured questions with preset response options

export type OptionChoice = {
  label: string;
  description?: string;
  emoji?: string;
};

export type MultiChoiceQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  question: string;
  options: OptionChoice[];
  multiSelect?: boolean;
  followUp?: string;
};

export const MULTI_CHOICE_QUESTIONS: MultiChoiceQuestion[] = [
  {
    day: 1,
    phase: "seed",
    question: "How are you starting today?",
    options: [
      { label: "Strong", emoji: "⚡", description: "Energized and ready" },
      { label: "Steady", emoji: "🌊", description: "Calm and grounded" },
      { label: "Uncertain", emoji: "🤔", description: "Not sure yet" },
      { label: "Tired", emoji: "😴", description: "Still waking up" },
    ],
  },
  {
    day: 2,
    phase: "seed",
    question: "What did day 1 teach you?",
    multiSelect: true,
    options: [
      { label: "I have rhythm", description: "Morning is my best time" },
      { label: "I can focus", description: "I can do deep work" },
      { label: "I need breaks", description: "Pacing matters" },
      { label: "I need support", description: "Accountability helps" },
    ],
  },
  {
    day: 3,
    phase: "learn",
    question: "Where's your energy strongest?",
    options: [
      { label: "Morning", emoji: "🌅", description: "5-9 AM" },
      { label: "Late morning", emoji: "☀️", description: "9 AM-12 PM" },
      { label: "Afternoon", emoji: "🌤️", description: "12-5 PM" },
      { label: "Evening", emoji: "🌙", description: "5 PM+" },
    ],
  },
  {
    day: 4,
    phase: "learn",
    question: "What's your biggest blocker?",
    options: [
      { label: "Distraction", description: "Phone, notifications, interruptions" },
      { label: "Energy dips", description: "Can't sustain focus" },
      { label: "Motivation", description: "Don't feel like it" },
      { label: "Clarity", description: "Not sure what to work on" },
      { label: "Something else", description: "Tell me more" },
    ],
  },
  {
    day: 5,
    phase: "learn",
    question: "How's your consistency this week?",
    options: [
      { label: "Perfect", emoji: "✓", description: "Done everything" },
      { label: "Strong", emoji: "✓✓", description: "Mostly on track" },
      { label: "Okay", emoji: "~", description: "Some slip-ups" },
      { label: "Struggling", emoji: "✗", description: "Off track" },
    ],
  },
  {
    day: 6,
    phase: "act",
    question: "Can you go bigger today?",
    options: [
      { label: "Yes, let's do it", emoji: "💪", description: "Push harder" },
      { label: "Maybe tomorrow", description: "Not today" },
      { label: "Same as always", description: "Comfortable pace" },
    ],
  },
  {
    day: 7,
    phase: "act",
    question: "What's your biggest win this week?",
    options: [
      { label: "Consistency", description: "Stayed the course" },
      { label: "Growth", description: "Pushed my limits" },
      { label: "Clarity", description: "Learned about myself" },
      { label: "Habits", description: "Built something lasting" },
    ],
  },
];

// ─── VARIATION 3: Reflection Prompt Format ──────────────────────────────────
// Deeper, more contemplative questions for self-discovery

export type ReflectionPrompt = {
  day: number;
  phase: "seed" | "learn" | "act";
  prompt: string;
  guidance: string;
  prompts?: string[]; // Optional sub-questions to guide thinking
  timeEstimate?: string;
};

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    day: 1,
    phase: "seed",
    prompt: "What do you want this week to mean?",
    guidance: "Think beyond tasks. What matters?",
    prompts: [
      "What would make this week feel successful?",
      "What are you hoping to discover?",
      "What's one thing you want to honor?",
    ],
    timeEstimate: "5 min",
  },
  {
    day: 2,
    phase: "seed",
    prompt: "What's your natural rhythm?",
    guidance: "When do you do your best thinking?",
    prompts: [
      "What time do you naturally wake up energized?",
      "When do you lose focus?",
      "What resets your energy?",
    ],
    timeEstimate: "4 min",
  },
  {
    day: 3,
    phase: "learn",
    prompt: "What pattern surprised you?",
    guidance: "Notice what you've learned about yourself",
    prompts: [
      "What happened yesterday that you didn't expect?",
      "What's been easier than you thought?",
      "What's been harder?",
    ],
    timeEstimate: "4 min",
  },
  {
    day: 4,
    phase: "learn",
    prompt: "What would unblocker you?",
    guidance: "If one thing changed, what would it be?",
    prompts: [
      "What's one friction point you could remove?",
      "What's one support you could add?",
      "What would make tomorrow easier?",
    ],
    timeEstimate: "5 min",
  },
  {
    day: 5,
    phase: "learn",
    prompt: "What momentum have you built?",
    guidance: "Acknowledge your progress, even the small wins",
    prompts: [
      "What are you proud of so far?",
      "What's becoming easier?",
      "What's becoming part of your normal?",
    ],
    timeEstimate: "4 min",
  },
  {
    day: 6,
    phase: "act",
    prompt: "What's your edge this week?",
    guidance: "Where can you stretch just a little further?",
    prompts: [
      "What's one thing you want to try?",
      "What would growth look like today?",
      "What's your small bold move?",
    ],
    timeEstimate: "3 min",
  },
  {
    day: 7,
    phase: "act",
    prompt: "What did this week teach you?",
    guidance: "Extract the lesson. This shapes week 2.",
    prompts: [
      "What's one pattern you see clearly now?",
      "What do you want to keep?",
      "What do you want to change?",
      "What's your north star?",
    ],
    timeEstimate: "8 min",
  },
];

// ─── VARIATION 4: Narrative Question Format ─────────────────────────────────
// Story-driven questions that frame the journey

export type NarrativeQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  narrative: string; // The story setup
  question: string; // The direct question
  subtext?: string; // Additional context
};

export const NARRATIVE_QUESTIONS: NarrativeQuestion[] = [
  {
    day: 1,
    phase: "seed",
    narrative: "Day 1. You're writing the first sentence of your story.",
    question: "How does this story begin for you?",
    subtext: "What's the opening scene in your mind?",
  },
  {
    day: 2,
    phase: "seed",
    narrative: "Day 2. You've felt your own rhythm for the first time.",
    question: "Where did you move smoothly, and where did you resist?",
    subtext: "What's your natural pattern trying to tell you?",
  },
  {
    day: 3,
    phase: "learn",
    narrative:
      "Day 3. A pattern is emerging. You notice something about yourself.",
    question: "What did you spot that you didn't know before?",
    subtext: "The AI saw it too. Should we follow this thread?",
  },
  {
    day: 4,
    phase: "learn",
    narrative:
      "Day 4. The picture is getting clearer, but something's in the way.",
    question: "What's the one thing slowing you down?",
    subtext: "Name it. Understanding it is the first step.",
  },
  {
    day: 5,
    phase: "learn",
    narrative:
      "Day 5. You're halfway through. Momentum is building or shifting.",
    question: "How does momentum feel right now?",
    subtext: "What's sustaining it? What needs support?",
  },
  {
    day: 6,
    phase: "act",
    narrative:
      "Day 6. You've built something real. The AI is ready to challenge you.",
    question: "Do you feel ready to go further?",
    subtext: "This is where consistency meets growth.",
  },
  {
    day: 7,
    phase: "act",
    narrative:
      "Day 7. One week in. The story has an opening, a rising action, and a lesson.",
    question: "What's the title of chapter one?",
    subtext: "What does this week's story mean to you?",
  },
];

// ─── VARIATION 5: Tension-Based Question Format ──────────────────────────────
// Questions that reveal the gap between intention and reality

export type TensionQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  intention: string; // What you hoped
  reality: string; // What actually happened
  question: string; // The bridging question
};

export const TENSION_QUESTIONS: TensionQuestion[] = [
  {
    day: 1,
    phase: "seed",
    intention: "You wanted to start fresh",
    reality: "Now you're living into the first day",
    question: "What's different from what you imagined?",
  },
  {
    day: 2,
    phase: "seed",
    intention: "You wanted to repeat yesterday",
    reality: "Today has its own rhythm",
    question: "What's trying to emerge that's different?",
  },
  {
    day: 3,
    phase: "learn",
    intention: "You wanted to move forward steadily",
    reality: "Patterns are revealing themselves",
    question: "What does the data show that your gut already knew?",
  },
  {
    day: 4,
    phase: "learn",
    intention: "You wanted smooth sailing",
    reality: "Blockers appeared",
    question: "What's this blocker trying to teach you?",
  },
  {
    day: 5,
    phase: "learn",
    intention: "You wanted to feel energized",
    reality: "Energy rises and dips",
    question: "What can you honor about your natural cycles?",
  },
  {
    day: 6,
    phase: "act",
    intention: "You wanted to take it easy",
    reality: "You're ready for something bigger",
    question: "What would happen if you said yes to growth?",
  },
  {
    day: 7,
    phase: "act",
    intention: "You wanted a quick fix",
    reality: "You built a foundation",
    question: "What's the real value of what you've created?",
  },
];

// ─── VARIATION 6: Hybrid Format (Recommended) ──────────────────────────────
// Combines structure with flexibility - best of all worlds

export type HybridQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  shortForm: string; // Quick single-word to 3-word answer
  expandedForm: string; // Full reflection version
  options?: string[]; // Optional multiple choice
  guidance?: string;
  responseType: "quick" | "medium" | "deep";
};

export const HYBRID_QUESTIONS: HybridQuestion[] = [
  {
    day: 1,
    phase: "seed",
    shortForm: "How are you?",
    expandedForm: "Describe your starting state — mood, energy, readiness",
    options: ["Energized", "Calm", "Uncertain", "Tired"],
    responseType: "quick",
  },
  {
    day: 2,
    phase: "seed",
    shortForm: "What worked?",
    expandedForm:
      "What from day 1 felt natural and worth keeping? What surprised you?",
    responseType: "medium",
  },
  {
    day: 3,
    phase: "learn",
    shortForm: "What pattern emerged?",
    expandedForm:
      "You've now got 2 days of data. What's repeating? What changed?",
    guidance: "The AI is looking for reliable signals — help it find them",
    responseType: "medium",
  },
  {
    day: 4,
    phase: "learn",
    shortForm: "What's blocking you?",
    expandedForm:
      "Name the one friction point. Is it external or internal? Fixable or not?",
    options: [
      "Distraction",
      "Energy",
      "Clarity",
      "Motivation",
      "Something else",
    ],
    responseType: "medium",
  },
  {
    day: 5,
    phase: "learn",
    shortForm: "How's momentum?",
    expandedForm:
      "Rate your consistency (1-10). What's keeping you on track? What's pulling you off?",
    responseType: "quick",
  },
  {
    day: 6,
    phase: "act",
    shortForm: "Ready to push?",
    expandedForm:
      "The AI thinks you can go further. Do you feel that too? What would it look like?",
    guidance:
      "Stretch is optional — but you might surprise yourself if you try",
    responseType: "quick",
  },
  {
    day: 7,
    phase: "act",
    shortForm: "What's your lesson?",
    expandedForm:
      "Look back. What's the story of this week? One pattern, one strength, one next step.",
    guidance: "This becomes the foundation for everything that follows",
    responseType: "deep",
  },
];

// ─── VARIATION 7: Confidence-Weighted Questions ──────────────────────────────
// Adapts question type and depth based on current confidence scores

export type ConfidenceWeightedQuestion = {
  day: number;
  phase: "seed" | "learn" | "act";
  threshold: "low" | "medium" | "high"; // AI confidence in the domain
  questionIfLowConfidence: string;
  questionIfMediumConfidence: string;
  questionIfHighConfidence: string;
};

export const CONFIDENCE_WEIGHTED_QUESTIONS: ConfidenceWeightedQuestion[] = [
  {
    day: 1,
    phase: "seed",
    threshold: "low",
    questionIfLowConfidence:
      "Help me understand: what matters most to you right now?",
    questionIfMediumConfidence:
      "Based on your setup, what's your priority today?",
    questionIfHighConfidence:
      "I see you're focused on [domain]. Is that still the priority?",
  },
  {
    day: 3,
    phase: "learn",
    threshold: "low",
    questionIfLowConfidence:
      "I'm still learning. What's one thing I should know?",
    questionIfMediumConfidence:
      "I'm noticing a pattern with [something]. Does that ring true?",
    questionIfHighConfidence:
      "I'm confident that [pattern] is reliable. Should I build on this?",
  },
  {
    day: 5,
    phase: "learn",
    threshold: "medium",
    questionIfLowConfidence:
      "We're building the picture together. What surprised you this week?",
    questionIfMediumConfidence:
      "I see enough to make suggestions now. What's changed since day 1?",
    questionIfHighConfidence:
      "Your pattern is clear. How do you want me to work with it?",
  },
  {
    day: 7,
    phase: "act",
    threshold: "high",
    questionIfLowConfidence:
      "I have limited data. What should I prioritize learning?",
    questionIfMediumConfidence:
      "I understand your baseline. What's one thing to build on next week?",
    questionIfHighConfidence:
      "I know your pattern well. Are you ready for a personalized plan?",
  },
];
