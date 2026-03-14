# Life OS Mobile UI/UX Blueprint

## Product position

This is a **mobile Life OS application**, not a web dashboard, not a landing page, and not a generic chatbot app.

It helps users manage life across:

* Finance & Money
* Health & Fitness
* Mental Wellness
* Tasks & Productivity
* Career
* Relationships
* Faith & Spiritual Life
* Space / Design & Decor

The app includes an AI layer that can:

* generate plans
* suggest actions
* create drafts
* request approval before major changes
* help users review and adjust their week

The product should feel like:

* calm
* premium
* intelligent
* practical
* structured
* deeply mobile-native

---

# 1) Core UX principle

The app should not feel like “a lot of tools.”

It should feel like:

**one intelligent daily operating system**.

That means the user should not be dropped into complexity first.

The experience should center on:

* what matters today
* what the AI recommends next
* what needs approval
* how the week is going
* quick access to deeper domains when needed

---

# 2) Mobile information architecture

## Primary navigation

Use **bottom tabs** for top-level navigation.

### Recommended tabs

* **Today**
* **Planner**
* **Domains**
* **AI**
* **Profile**

This is the cleanest v1 structure.

## What each tab does

### Today

The main home screen.
This is the default entry point.

It shows:

* today’s focus
* top 3 priorities
* habits / routines due today
* AI suggestions
* pending approvals
* quick check-in
* progress snapshot

### Planner

The week/month planning workspace.

It includes:

* weekly plan
* daily breakdown
* AI-generated planning suggestions
* plan adjustment actions
* review and reset flows

### Domains

A hub for all life areas.

Each domain gets its own card and drill-down screen:

* finance
* health
* wellness
* productivity
* career
* relationships
* faith
* space

### AI

Dedicated conversational surface.

Not just chat. It should support:

* ask
* plan
* review
* reflect
* propose
* explain

### Profile

Preferences, personalization, settings, memory controls, AI behavior settings, and account info.

---

# 3) Navigation structure

## Top level

Use bottom tabs.

## Secondary navigation

Use stack navigation inside each tab.

## Modal / sheet interactions

Use bottom sheets or full-screen modals for:

* quick add
* approvals
* AI action previews
* check-ins
* editing routines
* creating goals
* confirming changes

This is important because sheets feel more native and faster on mobile than constant page navigation.

---

# 4) Screen inventory

## High-priority screens

### Onboarding

* welcome
* choose focus areas
* planning style
* AI preferences
* notification/routine preferences
* first-week setup

### Today screen

* hero summary of the day
* top priorities
* today’s habits
* quick check-in
* pending approvals
* AI suggestion cards

### Weekly planner

* week overview
* day-by-day plan
* energy-aware suggestions
* drag/reorder priorities
* “regenerate lightly” / “reduce load” options

### AI chat

* conversational assistant
* quick prompts
* recent threads
* attached plan cards
* suggested follow-up chips

### Approval sheet

* action preview
* what the AI wants to change
* why it recommends it
* approve / edit / reject

### Domain hub

* domain cards
* progress state
* active goals
* shortcuts into each domain

### Finance overview

* spending health
* budget status
* savings goals
* recent issues
* AI recovery suggestions

### Wellness check-in

* mood / stress / energy
* pattern summary
* decompression suggestions
* reflection prompts

### Profile / preferences

* planning style
* AI tone
* notification timing
* active domains
* privacy and memory controls

---

# 5) UX model for the mobile app

## The user journey should feel like this

### Open app

User lands on **Today**, not a generic dashboard.

### Immediately sees

* what matters most
* what is due
* what the AI suggests
* whether anything needs approval

### Can act fast

* quick check-in
* quick add task/habit
* approve suggestion
* open weekly plan
* ask AI for help

### Can go deeper when needed

* domain details
* full planner
* full AI conversation
* reviews and analysis

This keeps the app from feeling overwhelming.

---

# 6) Mobile design system direction

## Visual style

The style should be:

* modern
* premium
* calm
* soft but sharp
* mobile-native
* focused on depth and clarity
* not visually noisy

## Avoid

* web hero sections
* crowded dashboards
* tiny unreadable charts everywhere
* fintech-landing-page aesthetics
* overuse of gradients
* gimmicky AI visuals
* glassmorphism everywhere
* overly bright gamified design

## Use instead

* strong spacing
* layered cards
* subtle elevation
* soft contrast
* high readability
* clear visual hierarchy
* large touch-friendly actions
* deliberate empty space

## Typography

Use a readable, calm hierarchy:

* large title for screen context
* medium heading for sections
* strong body text
* small muted helper text

Typography should feel premium and stable, not playful or chaotic.

## Shape language

* rounded corners
* gentle card surfaces
* pill chips for filters and prompts
* bottom sheets with clean handles
* large primary buttons

## Motion

Use animation sparingly:

* soft screen transitions
* bottom sheet motion
* card expand/collapse
* subtle feedback on approvals and AI actions

No excessive floating or distracting animation.

---

# 7) Component system for mobile

## Core components

You should standardize these:

### Layout

* AppShell
* ScreenHeader
* SectionHeader
* BottomTabBar
* StickyActionBar

### Cards

* SummaryCard
* DomainCard
* AIInsightCard
* ApprovalCard
* RoutineCard
* ProgressCard
* ReflectionCard

### Actions

* PrimaryButton
* SecondaryButton
* IconButton
* FloatingQuickAddButton
* InlineActionChip

### Inputs

* SearchInput
* ChatInput
* QuickCheckInInput
* SliderInput
* ToggleRow
* PreferenceSelector

### Planning components

* DayPlanCard
* WeekStrip
* PlanBlock
* PriorityItem
* HabitRow
* AIPlanSummaryCard

### AI-specific

* AIMessageBubble
* ToolActionPreview
* ApprovalSheet
* SuggestedPromptChip
* AgentStateBanner

---

# 8) Core flows to design first

## Flow 1: Onboarding

Goal: get enough signal for the AI to be useful quickly.

Steps:

* welcome
* choose active domains
* choose planning style
* choose tone / AI style
* choose weekly goals
* choose reminders/check-ins
* arrive on Today with starter suggestions

## Flow 2: First weekly plan

* user opens planner
* AI asks a few structured setup questions
* generates weekly plan
* user reviews and adjusts
* suggested actions become drafts
* user approves selected actions

## Flow 3: Daily use

* open Today
* check priorities
* log quick check-in
* complete a task or habit
* review AI suggestion
* continue day

## Flow 4: AI approval

* AI proposes change
* app shows preview
* user approves / edits / rejects
* change is executed or discarded

## Flow 5: Weekly review

* end-of-week summary
* what worked / what did not
* burnout or overload analysis
* next week adjustments
* AI updates plan

---

# 9) Best screen priorities for design and code

Build these first in order:

1. Onboarding
2. Today
3. Weekly Planner
4. AI Chat
5. Approval Sheet
6. Domain Hub
7. Finance Overview
8. Wellness Check-In
9. Profile / Preferences

---

# 10) Master mobile UI prompt

Use this as your master prompt for design generation.

```md
Design a production-ready mobile application UI/UX system for a Life OS app.

This is a mobile application, not a web app, not a desktop dashboard, and not a marketing landing page.

The app helps users manage life across:
- Finance & Money
- Health & Fitness
- Mental Wellness
- Tasks & Productivity
- Career
- Relationships
- Faith & Spiritual Life
- Space / Design & Decor

The app includes an AI orchestration layer that can:
- generate plans
- suggest actions
- create drafts
- ask for approval before major changes
- help users review their week
- help users reflect and adjust their life systems

Design goals:
- mobile-first
- native mobile feel
- calm and premium
- highly usable
- practical, not gimmicky
- low cognitive load
- thumb-friendly
- structured but warm
- modern without looking like a fintech landing page

The app should feel like:
- a personal operating system
- a calm intelligent coach
- a daily command center
- a trusted planning companion

Important UX constraints:
- do not design this like a website
- do not use giant hero banners
- do not make it look like a web dashboard squeezed into mobile
- avoid clutter, visual noise, and too many simultaneous widgets
- prioritize daily clarity over data density
- use bottom tabs for primary navigation
- use sheets and modals for quick actions and approvals
- design for React Native / Expo patterns
- interactions should feel native and realistic for mobile use

Primary navigation should include:
- Today
- Planner
- Domains
- AI
- Profile

Prioritize these screens:
- onboarding
- today screen
- weekly planner
- AI chat
- approval flow
- domain hub
- finance overview
- wellness check-in
- profile/preferences

Output should include:
- app information architecture
- mobile navigation system
- key user flows
- design system guidance
- screen-by-screen UX breakdown
- key screen wireframe descriptions
- component recommendations for a React Native mobile app
```

---

# 11) Screen-specific prompt pack

## Prompt: Today screen

```md
Design a premium mobile Today screen for a Life OS app.

This is the main home screen of the application.

The goal of the screen is to help the user quickly understand:
- what matters today
- what needs attention
- what the AI recommends next
- what is due
- whether any approvals are pending

The screen should include:
- a strong but compact greeting/header
- today’s top 3 priorities
- today’s habits or routines
- a quick mood/energy check-in entry point
- AI suggestion cards
- pending approval card if present
- subtle progress summary
- a quick add action

Design constraints:
- mobile-first
- calm
- premium
- practical
- not dashboard-heavy
- not cluttered
- no giant hero section
- strong hierarchy
- thumb-friendly layout
- built for React Native mobile patterns

The visual style should feel like a calm personal operating system.
```

## Prompt: Weekly planner screen

```md
Design a production-ready mobile weekly planner screen for a Life OS app.

This screen should help the user:
- review the week
- understand daily themes
- see AI-generated planning suggestions
- adjust workload
- avoid overload
- approve suggested actions

The screen should include:
- week header
- weekly summary
- daily cards or day strip
- top priorities for the week
- energy-aware notes
- AI planning insights
- controls to regenerate, lighten, or refine the plan
- access to suggested tasks/habits/actions

Design constraints:
- mobile-native layout
- no web dashboard styling
- clean scrolling experience
- clear distinction between summary and daily details
- minimal clutter
- supports bottom sheets for action details and approvals
```

## Prompt: AI chat screen

```md
Design a premium mobile AI chat screen for a Life OS app.

This is not a generic chatbot screen.
It is the conversational interface for a multi-domain Life OS assistant.

The screen should support:
- normal conversation
- AI plan generation
- action suggestions
- plan summaries
- follow-up prompt chips
- tool/action previews
- approval handoffs

The design should include:
- elegant mobile chat layout
- assistant messages with structured cards when relevant
- user messages
- follow-up suggestion chips
- sticky chat input
- lightweight thread history access
- attachments for plans or summaries
- clear transitions into approvals or domain actions

Avoid:
- generic empty chatbot look
- excessive neon AI aesthetics
- cluttered debug-style interfaces
```

## Prompt: Approval sheet

```md
Design a mobile approval sheet for a Life OS app.

This sheet appears when the AI wants to make an important change or create something meaningful.

Examples:
- create savings goal
- update plan
- schedule routine
- adjust budget cap
- create recurring habit

The approval UI should clearly show:
- what the AI wants to do
- why it recommends it
- what will change
- the affected domain
- edit, approve, and reject actions

Design should feel:
- trustworthy
- clear
- calm
- high confidence
- not alarming
- not overly technical

Use a bottom sheet or modal pattern appropriate for mobile apps.
```

## Prompt: Domain hub

```md
Design a mobile domain hub screen for a Life OS app.

This screen is a gateway into the user’s life domains:
- Finance
- Health
- Wellness
- Productivity
- Career
- Relationships
- Faith
- Space

Each domain should feel like part of one system, not a separate app.

The screen should include:
- domain cards
- active goals or progress hints
- quick status indicators
- entry points into each domain
- optional AI suggestions tied to domains

The design should feel:
- unified
- premium
- calm
- mobile-native
- easy to scan
```

---

# 12) UX rules for the frontend team

Use these rules when building screens:

### Rule 1

Every screen must answer:
**what can the user do here right now?**

### Rule 2

Do not overload the top of the screen with decoration.

### Rule 3

Today and Planner should feel more important than raw analytics.

### Rule 4

AI suggestions should look actionable, not magical.

### Rule 5

Approvals must be transparent and understandable.

### Rule 6

Use domain color as a hint, not as visual chaos.

### Rule 7

Prefer cards, lists, sheets, and segmented views over dense dashboards.

### Rule 8

Make quick entry and fast review feel effortless.

---

# 13) Best visual direction

A good visual mix would be:

* soft premium surfaces
* clean dark mode
* muted accent colors by domain
* strong typography
* modern card composition
* subtle gradients only where useful
* elegant spacing
* slightly editorial, but still product-focused

Think:

* less “startup landing page”
* less “fintech analytics wall”
* more “calm command center for life”

---

# 14) Best next deliverables

The smartest next outputs are:

1. **mobile information architecture doc**
2. **screen inventory doc**
3. **screen-by-screen UX specs**
4. **React Native component map**
5. **high-fidelity prompt pack for code generation**
6. **actual screen code starting with Today + Planner**

# 15) The real answer

Yes — you needed a **mobile application prompt**, and not a weak one.

You need a prompt system that forces the design to be:

* mobile-native
* structured
* calm
* premium
* actionable
* AI-aware
* approval-aware
* not web-shaped

If you want the next best move, it is this:
