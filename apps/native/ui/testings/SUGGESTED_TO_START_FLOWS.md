# "Suggested to Start" Domain Activation Flows

> After a user unlocks a domain, what's the first action we suggest? This document defines the post-activation onboarding for each domain, including timing, messaging, UI patterns, and success metrics.

---

## Overview

When a user activates a new domain (Finance, Health, Relationships, Career), they enter a "warm-up" flow designed to:

1. **Reduce friction** — get them to one real action quickly
2. **Seed data** — collect enough context for Day 2+ suggestions
3. **Show value** — let them see a concrete outcome immediately
4. **Personalize** — use their existing profile data (energy, commitment, goals)

### Timing Strategy

| Domain | Activated On | First Suggestion | Timing |
|--------|--------------|------------------|--------|
| Finance | Day 1–2 | Connect a bank account OR log an expense | Immediately (same screen) |
| Health | Day 4 | Schedule first workout OR log how you moved today | Within 4 hours (next app session) |
| Relationships | Day 4–6 | Add first contact OR message someone | Within 24 hours (beginning of next day) |
| Career | Day 6+ | Create first goal OR pick a project to track | Within 2 days (Day 7 or 8) |

### Success Definition

| Domain | Success Metric | Goal |
|--------|----------------|------|
| Finance | User connected account OR logged first transaction | 80% completion within 48h |
| Health | User logged first activity OR booked first session | 75% completion within 7 days |
| Relationships | User added first contact OR had first conversation logged | 70% completion within 14 days |
| Career | User created first goal OR linked first project | 65% completion within 14 days |

---

## Domain 1: Finance

### Scenario

User just activated Finance on **Day 1 or 2**. They're early, motivated, and observing. This is the ideal time to capture real money data.

### Suggested First Action

**Goal:** Connect a bank account or manually log your first expense.

**Copy (Suggested prompt text):**

```
"Let's see where your money goes.

You can connect a bank account for automatic tracking
(we never see your password), or just log what you spent today.

Either way, we'll have the signal we need to help you
spend smarter as the week goes on."
```

**Alternative (if account connection fails):**

```
"No problem. Just tell us:
• What did you spend money on today?
• How much?

That's enough for us to start learning your patterns."
```

### Visual Design

**Component Type:** Sheet Modal (slides up from bottom)

**Structure:**
- Header: "Connect Finance" with close button
- 2-button CTA choice:
  - Primary button: "Connect bank account" (connects securely)
  - Secondary button: "Log expense manually" (quick input form)
- If bank is chosen: third-party OAuth flow (Plaid/similar)
- If manual is chosen: inline form with 3 fields (category, amount, note)

**Color scheme:**
- Border: `--amber-border` (#F0D090)
- Background: `--amber-bg` (#FDF3E0)
- Primary button: `--amber` (#9A6B1A)

**Animations:**
- Sheet slides up 0.28s cubic-bezier(0.4, 0, 0.2, 1)
- Success state: green checkmark, then dismiss automatically after 2s

### Timing

**When:** Immediately after user taps "Add Finance domain"

**Duration:** User should complete in 2–3 minutes

### Success Metrics

- **Primary:** User connected account OR logged expense within this session
- **Secondary:** Confidence score for "Finance" jumps to 55+ (from 0)
- **Fallback:** User dismissed but returned to log expense within 24h

### Additional Context

**Confidence scoring after action:**
- Account connected: +60 points (rich signal)
- Expense logged manually: +35 points
- Dismissed without action: 0 points (retry on Day 3)

**Day 2+ behavior:**
- If account connected: show "Analyzing your spending..." insight
- If manual only: suggest "Log 2–3 more expenses to see patterns"
- If dismissed: re-prompt on Day 3 with softer messaging ("No pressure on Finance yet, but...")

---

## Domain 2: Health

### Scenario

User activated Health on **Day 4**. They've shown 3 days of consistency and energy. They're mid-week, building momentum. Health suggestions should feel achievable, not ambitious.

### Suggested First Action

**Goal:** Log what you moved today OR schedule your first workout.

**Copy (Suggested prompt text):**

```
"You've been focused all week. Let's keep the energy up.

Did you move today? Even a 10-minute walk counts.
Or pick a workout you want to do this week.

We'll learn what rhythm works for you."
```

**Alternative (if they haven't moved yet today):**

```
"It's Day 4. Your energy is steady—this is the time to add movement.

What sounds good right now?
• 10-min walk
• 15-min stretch
• 30-min workout
• Something else?"
```

### Visual Design

**Component Type:** Suggestion Card + Quick Action Sheet

**Structure:**
- Suggestion card appears on Day 4 morning screen
- Shows 3 quick-tap options:
  - "I moved today" (log past activity)
  - "Schedule workout" (pick day/time)
  - "Not now" (snooze 2 days)
- Tap any button → slides to activity logging sheet

**Color scheme:**
- Border: `--teal-border` (#A8D8D3)
- Background: `--teal-bg` (#E6F5F3)
- Primary button: `--teal` (#2A7A6F)

**Activity logging form:**
- Activity type picker: Walk / Run / Stretch / Gym / Sports / Other
- Duration: slider 5–120 min
- When: Today / Tomorrow / This week
- Notes (optional): "How did it feel?"

### Timing

**When:** Day 4, morning screen load (or first app session on Day 4)

**Duration:** 1–2 minutes to log

**Re-prompt logic:**
- If dismissed: re-prompt on Day 5
- If logged: show confidence boost on Day 5 morning
- If scheduled: remind on scheduled day at activity time

### Success Metrics

- **Primary:** User logged activity OR scheduled workout within 24h of Day 4
- **Secondary:** Confidence score for "Exercise" jumps 15+ points
- **Tertiary:** User completes scheduled activity (notification sent)

### Additional Context

**Confidence scoring after action:**
- Logged activity: +25 points
- Scheduled future activity: +15 points
- Dismissed twice: show "Health can wait" message on Day 5

**Day 5+ behavior:**
- If completed: "Nice. Consistency is the signal we watch. Keep it up?"
- If scheduled but not done: Day 5 reminder "Your workout is coming up"
- If only viewed but didn't log: suggest "What stopped you?" on Day 6

---

## Domain 3: Relationships

### Scenario

User activated Relationships on **Day 4–6**. Focus and habits confidence are high. This is a softer domain—about connection, not productivity. Timing is flexible, but should feel warm and intentional, not pushy.

### Suggested First Action

**Goal:** Add your first contact (person you want to stay connected with).

**Copy (Suggested prompt text):**

```
"You're building strong habits for yourself.
Now let's make sure you're staying connected to people who matter.

Who's one person you want to keep closer?
Just add their name. We'll help you stay in touch."
```

**Alternative (more direct):**

```
"Add one person you care about.

We'll remind you to check in when it matters—
no forced smalltalk, just real connection."
```

**Alternative (if user hesitant):**

```
"This one's different. Not about productivity, just about being human.

One person, one name. That's the start."
```

### Visual Design

**Component Type:** Sheet Modal with simple form

**Structure:**
- Header: "Add a connection" with close
- Form fields:
  - Name (text input, required)
  - Relationship: Friend / Family / Mentor / Colleague / Other (dropdown)
  - How often do you want to connect? Weekly / Monthly / When life happens (picker)
- Submit button: "Save"
- Success state: show name with checkmark, auto-dismiss after 3s

**Color scheme:**
- Border: `--purple-border` (#C9C1F5)
- Background: `--purple-bg` (#F0EEFF)
- Primary button: `--purple` (#6B5ECD)

**Tone:** Warm, non-judgmental, human. Serif font for headers.

### Timing

**When:** Day 4–6, anytime. Soft prompt on home screen (not blocking).

**Duration:** 1 minute to add contact

**Follow-up:**
- Day 7: "You added [name]. Check in this week?"
- Day 8+: Smart reminders based on connection frequency

### Success Metrics

- **Primary:** User added first contact within 7 days of activation
- **Secondary:** Confidence score jumps to 45+ (reflects willingness to track)
- **Tertiary:** User initiates check-in with that contact within 14 days

### Additional Context

**Confidence scoring after action:**
- Contact added: +35 points
- First check-in logged: +20 additional points
- Dismissed: 0 points, re-prompt on Day 6 with softer tone

**Day 7+ behavior:**
- If contact added: "You care about [name]. How's the connection?"
- If not added: show testimonial from another user about value of tracking relationships
- Focus on habit, not frequency. "It's not about constant contact, just intention."

---

## Domain 4: Career

### Scenario

User activated Career on **Day 6+**. They have strong focus and habit signals. Career is a longer-term domain—this first action should feel grounded, specific, not vague.

### Suggested First Action

**Goal:** Create your first career goal OR link a project you're working on.

**Copy (Suggested prompt text):**

```
"You're showing strong focus patterns. Let's channel that.

What's one career thing you want to move forward?
A goal, a project, a skill you want to build.

Doesn't have to be big—just something real."
```

**Alternative (project-focused):**

```
"You're shipping focus blocks. What are you shipping?

Tell us about a project you're working on.
We'll help you make progress visible."
```

**Alternative (goal-focused):**

```
"Six days in, you're building momentum.
What's one career goal where that momentum matters?

We'll break it down and track your progress."
```

### Visual Design

**Component Type:** Choice Sheet → Form Sheet

**Structure:**

**Step 1 — Choice (appears on Day 6 screen):**
- Two buttons:
  - "Create a goal" (larger, primary)
  - "Track a project" (secondary)

**Step 2a — Goal form (if goal chosen):**
- Goal title (text input)
- Category: Skill / Promotion / Side project / Learning / Other
- Timeline: This month / Quarter / Year / Open-ended
- Why it matters (optional): text area
- Success button: "Create goal"

**Step 2b — Project form (if project chosen):**
- Project name (text input)
- Status: Planning / In progress / Wrapping up
- Key deliverable (optional)
- Due date (optional)
- Success button: "Save project"

**Color scheme:**
- Border: `--text` (#1C1B18)
- Background: white with light border
- Primary button: `--text` (dark, serious)
- Accent: could use `--purple` for goal, `--teal` for project

**Typography:** Serif for headers ("Your Goal"), sans for form labels.

### Timing

**When:** Day 6–7, shown as suggestion on home screen

**Duration:** 2–3 minutes to create goal/link project

**Re-prompt logic:**
- If dismissed: surface again on Day 7 with "Optional but valuable"
- If created: show on Day 8 morning with "Keep momentum" message
- If nothing: don't re-prompt aggressively (career is longer-term)

### Success Metrics

- **Primary:** User created goal or linked project within 7 days of activation
- **Secondary:** Confidence for "Career" reaches 55+
- **Tertiary:** User updates goal/project status within 14 days (habit signal)

### Additional Context

**Confidence scoring after action:**
- Goal created: +40 points
- Project linked: +35 points
- Dismissed: 0 points, one soft re-prompt on Day 7 only

**Day 7+ behavior:**
- If goal created: "Keep momentum on [goal name]. Weekly check-in?"
- If project linked: "You're tracking [project]. What's next?"
- Show micro-progress: "3 days of focus blocks on this goal already"

**Week 2 integration:**
- Goals/projects appear in priority calculation
- AI may suggest focus blocks specifically for goal work
- Check-ins now ask: "Did this move your [goal] forward?"

---

## Cross-Domain Patterns

### Shared Copy Principles

1. **Acknowledge progress first** — "You've been [specific behavior] for X days"
2. **Make the ask small** — "Just add one...", "Tell us one...", "Pick one..."
3. **Show immediate value** — "We'll learn X, which helps us Y"
4. **Offer escape** — Always have a "Not now" or "Later" option
5. **Be honest about why** — "This helps us personalize your week" (not "engagement metrics")

### Shared UI Patterns

| Pattern | When to use | Example |
|---------|------------|---------|
| **Suggestion Card** | Day 1–3, post-activation hints | Health: "Move today?" |
| **Sheet Modal** | Requiring input (account, name, goal) | Finance: account connection |
| **Quick Action Buttons** | Yes/No/Maybe decisions | Health: "Log workout?" |
| **Inline Form** | <5 fields, <2 min completion | Relationships: add contact |
| **Choice Sheet** | Picking between 2–3 paths | Career: goal vs. project |

### Confidence Score Mechanics

**Base scores after action:**
- Rich action (account connected, goal created): 35–60 points
- Simple action (contact added, expense logged): 15–35 points
- Dismissal: 0 points, can retry

**Score floor:** No domain starts below 20 confidence (ensures gentle suggestions)

**Score ceiling:** 100 confidence = AI ready for bold, proactive assignments

### Re-engagement if Dismissed

- **First dismiss:** Don't re-prompt same day
- **Second dismiss:** Try alternative copy on Day +2
- **Third dismiss:** Move to softer messaging ("No pressure on this")
- **After 3 dismisses:** Let it rest for 7+ days

---

## Implementation Checklist

- [ ] Define activation trigger (which screen, which button)
- [ ] Write 2–3 variations of copy for each domain
- [ ] Design sheet modal components (header, form, success state)
- [ ] Build confidence score transitions (0 → 35–60)
- [ ] Set up re-prompt logic (retry Day +2, Day +3, etc.)
- [ ] Create notification/reminder system for scheduled items
- [ ] Add analytics events: `activation_shown`, `action_completed`, `action_dismissed`
- [ ] Define Day 7 summary stats: "You added X contacts, created Y goals..."
- [ ] Build Week 2 integration: pull in goals/projects for priority calculation
- [ ] Add A/B test hooks: different copy variants, timing, UI styles
