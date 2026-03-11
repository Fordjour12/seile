# Planner UI Restructure Prompt + Product Spec

## Purpose

Redesign the Planner experience from a settings-heavy dashboard into a chat-first AI planning workspace.

This document is intended to be used as:
- a product direction brief
- a UI/UX restructuring spec
- a prompt for an AI coding agent
- a handoff document for engineering

---

## Core Problem

The current planner screen is trying to do too many things at once:

- planner landing page
- weekly actions
- planner profile settings
- goals creation
- agent toggle and automation controls
- current week execution view

That makes the feature feel like an internal admin panel or backend tester screen instead of an AI-first planning product.

The planner should feel like:
- conversational
- assistant-led
- calm
- focused
- mobile-native
- premium

It should not feel like:
- a giant settings page
- a CRUD dashboard
- a control panel full of chips, toggles, forms, and lists

---

## Product Direction

The Planner should be restructured into a **chat-first experience** with separate focused routes for execution, settings, goals, and agent controls.

### Target experience

**Main planner = conversation**
- user talks to the planner
- planner suggests plans
- planner explains tradeoffs
- planner offers actions
- planner creates or updates plans

**Plan detail = execution**
- see one plan clearly
- grouped by day
- mark items done
- review warnings
- replan
- log review

**Settings = hidden away**
- all profile controls and capacity guardrails live in settings
- they should not dominate the main planner surface

---

## Recommended Information Architecture

Use this route structure:

```txt
app/
  (app)/
    planner/
      index.tsx
      [id].tsx
      settings.tsx
      goals.tsx
      agent.tsx
      new.tsx
```

### Route responsibilities

#### `planner/index.tsx`
Primary planner home.
This should be the chat-first AI planning workspace.

Responsibilities:
- planner hero / current state
- chat thread
- quick actions
- message composer
- active plan preview card
- entry point for creating a balanced week, recovery week, replan, review

This route should **not** contain:
- full planner profile editor
- full goals management form
- full execution list grouped by day

---

#### `planner/[id].tsx`
Single plan detail screen.

Responsibilities:
- view a specific plan
- plan summary
- priorities
- warnings
- grouped plan items by day
- mark items done
- replan this plan
- log weekly review

This screen becomes the focused execution view.

---

#### `planner/settings.tsx`
Planner settings and capacity guardrails.

Responsibilities:
- timezone
- max tasks per day
- energy pattern
- planning style
- rest days
- deep work preference
- planner agent enabled / disabled
- optional scheduling preferences for review and plan generation

Everything settings-like belongs here.

---

#### `planner/goals.tsx`
Goal management screen.

Responsibilities:
- create goals
- edit goals
- list active goals
- archive or complete goals
- set domain, horizon, priority

The goals form should be removed from the main planner surface.

---

#### `planner/agent.tsx`
Planner agent and automation screen.

Responsibilities:
- show agent status
- show automation schedule
- show burnout score
- show recent weekly review summary
- show recent drafts or agent runs
- enable / disable automation
- explain what the agent does

Optional in v1, but the right home for the agent layer.

---

#### `planner/new.tsx`
Optional guided creation flow.

Responsibilities:
- let the user choose:
  - balanced week
  - recovery week
  - discovery planning
  - zero-input planning
- then launch plan creation in a more guided way for non-chat users

---

## UI/UX Principle

### The main planner screen must be chat-first

The primary feeling should be:
- “I am talking to my planner”
- “The AI is guiding me”
- “I can act quickly”
- “I can open deeper details if I want”

### The chat should support structured cards

Messages can render rich cards inside the thread, such as:
- weekly plan summary card
- current plan preview card
- recovery suggestion card
- burnout warning card
- goal recommendation card
- replan proposal card

This keeps the experience conversational without making it vague.

---

## Recommended Main Screen Layout

### `planner/index.tsx`

Structure:

1. Header / hero
2. Current plan preview card
3. Chat thread
4. Quick actions row
5. Composer

### Suggested content

#### Header
- title: Planner
- subtitle: AI Chief-of-Staff
- maybe a tiny badge showing Agent On / Off
- maybe current week status

#### Current plan preview card
- plan title
- plan mode: balanced / recovery
- 2–3 priorities
- burnout score
- open plan CTA

#### Chat thread
Conversation between user and planner.
This is the main content area.

Examples of user messages:
- Plan my week
- I feel behind
- Help me figure out what to focus on
- Give me a recovery plan
- Review last week

Examples of AI responses:
- summary
- recommendations
- warnings
- structured action cards
- suggested follow-ups

#### Quick actions
Examples:
- Balanced week
- Recovery week
- Replan current week
- Review last week

#### Composer
Placeholder:
- “Ask your planner anything…”

---

## Recommended Plan Detail Layout

### `planner/[id].tsx`

Structure:

1. Plan header
2. Plan summary
3. Priority badges
4. Warning section
5. Day-by-day grouped items
6. Action footer

### Suggested actions
- Replan remainder
- Log review
- Mark complete
- Lock item
- Edit plan item

This is where the structured weekly view belongs.

---

## What to move out of the current screen

### Move to `settings.tsx`
- timezone input
- max tasks per day
- energy pattern chips
- planning style chips
- rest day selection
- deep work preference switch
- planner agent toggle

### Move to `goals.tsx`
- goal title input
- goal domain input
- goal horizon chips
- goal priority chips
- goal list

### Move to `[id].tsx`
- grouped current week items
- full execution list
- item toggles
- warnings
- priorities
- review action
- replan action

### Keep on `index.tsx`
- planner chat
- high-level status
- quick create actions
- current plan preview
- open plan CTA

---

## Why the current UI feels wrong

The current screen is too dense and mixes:
- creation
- control
- settings
- execution
- automation

That creates:
- visual overload
- weak hierarchy
- no clear primary action
- no emotional sense of an assistant
- poor mobile scanning

The redesign must make the user immediately understand:

**This is where I talk to my planner.**
Not:
**This is where I configure planner internals.**

---

## Design Language Direction

The planner should look:
- mobile-native
- calm
- premium
- structured but not rigid
- assistant-led
- editorial with product clarity

Avoid:
- giant forms
- dashboard clutter
- too many chips on one screen
- heavy CRUD feeling
- settings-first layout
- development-console aesthetics

Prefer:
- clean spacing
- cards with clear hierarchy
- concise copy
- message bubbles or assistant cards
- modular sections
- progressive disclosure

---

## Suggested Component Breakdown

Create a dedicated planner component folder:

```txt
components/planner/
  PlannerHero.tsx
  PlannerChatThread.tsx
  PlannerComposer.tsx
  CurrentPlanPreviewCard.tsx
  PlannerQuickActions.tsx
  WeeklyPlanCard.tsx
  PlanHeader.tsx
  PlanWarnings.tsx
  PlanDaySection.tsx
  GoalList.tsx
  PlannerSettingsForm.tsx
  AgentStatusCard.tsx
```

### Notes

#### `PlannerHero.tsx`
Small clean hero with title, subtitle, week label, and status badges.

#### `PlannerChatThread.tsx`
Renders conversation between user and planner.
Supports text messages and structured planner cards.

#### `PlannerComposer.tsx`
Input composer for planner prompts.
Should feel like a messaging surface, not a search bar.

#### `CurrentPlanPreviewCard.tsx`
Compact summary of active plan with CTA to open detail screen.

#### `PlannerQuickActions.tsx`
Row or grid of fast actions:
- Balanced week
- Recovery week
- Replan
- Review

#### `PlanDaySection.tsx`
Used on `[id].tsx` for grouped plan items.

#### `PlannerSettingsForm.tsx`
All settings and guardrails in one dedicated screen.

#### `AgentStatusCard.tsx`
Shows:
- agent enabled state
- next review schedule
- burnout score
- recent automation summary

---

## Suggested Navigation Behavior

From the planner home screen:
- tapping the current plan preview opens `/planner/[id]`
- tapping settings opens `/planner/settings`
- tapping goals opens `/planner/goals`
- tapping agent opens `/planner/agent`

Keep navigation obvious and lightweight.

---

## Recommended Product Copy

### Hero subtitle options
- AI Chief-of-Staff
- Plan with clarity
- Your planning assistant
- Realistic weekly planning

### Quick action labels
- Draft my week
- Recovery plan
- Replan week
- Review last week

### Composer placeholder
- Ask your planner anything…
- What do you want help planning?
- Tell your planner what’s going on…

---

## Data / Backend Expectations

The redesigned UI should still connect to the same planner backend concepts:

- planner dashboard query
- current plan
- current plan items
- planner profile
- goals
- planner agent state
- create weekly plan action
- replan weekly plan action
- review weekly plan action
- upsert planner profile mutation
- create planning goal mutation
- set agent enabled mutation
- set plan item status mutation

But the UI should consume them through **smaller route-specific screens**, not one massive surface.

---

## Suggested Screen-Level Data Mapping

### `planner/index.tsx`
Needs:
- dashboard summary
- current plan preview
- agent summary
- quick actions
- chat state

### `planner/[id].tsx`
Needs:
- plan by id
- plan items by plan id
- warnings
- priority titles
- status mutation for items
- review action
- replan action

### `planner/settings.tsx`
Needs:
- planner profile
- agent state
- upsert profile mutation
- agent toggle mutation

### `planner/goals.tsx`
Needs:
- goal list
- create goal
- update goal
- archive goal

### `planner/agent.tsx`
Needs:
- agent state
- recent review summary
- burnout score
- automation history if available

---

## Migration Guidance

Refactor the current giant screen into smaller parts.

### Step 1
Extract current week execution UI into `planner/[id].tsx`

### Step 2
Extract settings into `planner/settings.tsx`

### Step 3
Extract goals into `planner/goals.tsx`

### Step 4
Turn `planner/index.tsx` into chat-first planner home

### Step 5
Add planner-specific components folder

### Step 6
Clean duplicated code and remove the copied screen duplication entirely

---

## Engineering Rules

- keep each route focused on one job
- avoid giant screens with mixed concerns
- use reusable planner-specific components
- prefer lightweight preview cards over full management UI on home
- optimize for mobile scanning and touch targets
- keep the assistant feeling central to the experience

---

## Prompt for an AI Coding Agent

Use this prompt to guide implementation:

```md
Redesign the Planner feature into a chat-first mobile experience.

Current problem:
The existing Planner screen is a settings-heavy all-in-one dashboard that mixes planner actions, settings, goals, agent controls, and execution view into one surface. It feels like an internal admin panel instead of an AI chief-of-staff product.

Goal:
Restructure the Planner into a route-based experience with a conversational main screen and focused detail/settings screens.

Required route structure:
- `app/(app)/planner/index.tsx` → chat-first planner home
- `app/(app)/planner/[id].tsx` → single plan detail / execution screen
- `app/(app)/planner/settings.tsx` → planner settings and capacity guardrails
- `app/(app)/planner/goals.tsx` → goal management
- `app/(app)/planner/agent.tsx` → planner agent status and automation
- optional `app/(app)/planner/new.tsx` → guided plan creation

Product requirements:
1. Main Planner screen must feel like a conversation with an AI planner.
2. The main screen should show:
   - planner hero
   - active/current plan preview card
   - chat thread
   - quick actions
   - composer
3. The plan detail screen should show:
   - plan title
   - summary
   - priorities
   - warnings
   - grouped items by day
   - ability to mark items done
   - replan and review actions
4. Settings must be moved out of the main screen into `settings.tsx`.
5. Goal creation and management must be moved out of the main screen into `goals.tsx`.
6. Agent controls and automation visibility should live in `agent.tsx` or, at minimum, be reduced on the home screen.
7. Break the implementation into reusable components under `components/planner/`.

Design direction:
- mobile-first
- premium and calm
- conversational
- assistant-led
- minimal clutter
- progressive disclosure
- avoid dashboard/admin aesthetics

Avoid:
- giant forms on the home screen
- full CRUD management on the home screen
- overuse of chips/toggles/forms in the primary experience
- mixing settings with execution with chat

Recommended components:
- `PlannerHero`
- `PlannerChatThread`
- `PlannerComposer`
- `CurrentPlanPreviewCard`
- `PlannerQuickActions`
- `PlanHeader`
- `PlanWarnings`
- `PlanDaySection`
- `PlannerSettingsForm`
- `AgentStatusCard`

Implementation notes:
- preserve existing backend actions/mutations/queries where possible
- split route responsibilities cleanly
- remove duplicated code
- improve state ownership per screen
- keep the current plan execution flow intact but move it into `[id].tsx`

Success criteria:
- the planner home immediately feels like “talking to my planner”
- settings no longer dominate the main experience
- plan execution is focused in a dedicated screen
- goals and agent controls have proper homes
- the UI feels like a premium AI planning product, not a backend tester
```

---

## Final Outcome

The redesigned Planner should feel like:

- a conversation with an AI planning assistant on the home screen
- a focused operational plan on the detail screen
- a clean settings model behind the scenes
- a scalable route structure for future planner features

That is the correct direction for turning this into a serious AI planner product.
