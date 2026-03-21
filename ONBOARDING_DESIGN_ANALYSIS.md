# React Native Onboarding & Week 1 Design Analysis

## Executive Summary

Three distinct design approaches have been developed for Life OS's first-run and onboarding journey. Each emphasizes different aspects of the AI-driven experience:

1. **life_os_onboarding_week1.html** - Dark theme, narrative-driven progression through 7 days with rich AI messaging and pattern detection
2. **first_run_7day_journey.html** - Light theme, phase-based learning (Seed → Learn → Act) with explicit confidence metrics and progressive complexity
3. **activity_bottom_sheets.html** - Light theme, focused sheet-based activity interactions with detailed execution flows (timers, ratings, post-activity flows)

This analysis identifies the best features from each and provides a merge strategy for the definitive version.

---

## Design Comparison Table

| Dimension | life_os_onboarding_week1 | first_run_7day_journey | activity_bottom_sheets |
|-----------|--------------------------|------------------------|------------------------|
| **Visual Theme** | Dark (#0e0e10 bg) | Light (cream #FAFAF8) | Light (cream #FAFAF8) |
| **Navigation** | Vertical scroll, discrete days | Day tabs above phone | Bottom sheet modals |
| **AI Context Bar** | Linear progress bar (14%→100%) | Phase pills + progress card | Confidence cards (separate) |
| **First Message** | AI-first card w/ pulse animation | Insight card w/ amber bg | Morning check-in prompt |
| **Pattern Detection** | Day 3 "first pattern" with chips | Day 3 "first insight" confidence threshold | Inferred through ratings |
| **Suggestion Cards** | Day 4 suggestion + approval on Day 5 | Day 4 suggestion, Day 5 double suggestion | Implicit via activities |
| **Domain Setup** | Cards appear Days 4-6 inline | Unlock cards on Days 1-6 | Not shown in sheets |
| **Activity System** | Habits list, priorities inline | Activity cards with status toggles | Sheet-based with flows |
| **Check-in/Reflection** | Integrated into flow, casual | Dedicated sliders, explicit ratings | Detailed slider controls |
| **Timers/Execution** | Not shown | Not shown | Full timer with countdown |
| **Post-Activity** | Not shown | Not shown | Rating sheet (useful/hard) |
| **Streak Celebration** | Day 6 emoji celebration box | Day 6 observation w/ insight | Implicit in completion state |
| **Typography** | Inter-based (no serif) | Instrument Serif + Inter mix | Instrument Serif + Inter mix |
| **Spacing/Density** | Tight (margins 8-12px) | Relaxed (gaps 12-14px) | Relaxed (gaps 12-20px) |
| **Color Palette** | Purple-teal accents | 4-color system (purple/teal/amber/green) | Full 4-color + semantic palette |
| **Interactive States** | Chip hover, ring toggle | Button states, chip interact | Button states, slider interact |

---

## Best Features by Category

### 1. Visual Design & Theme

**Best Feature: Light Theme with Relaxed Spacing** (from first_run_7day_journey & activity_bottom_sheets)
- Cream background (#FAFAF8) is more approachable than dark theme
- Relaxed spacing (14-16px gaps, 20px padding) reduces cognitive load
- Better for sustained reading and form interaction
- **Recommendation**: Adopt light theme with intentional cream background

**Runner-up: Dark Theme Animation** (from life_os_onboarding_week1)
- Pulse animation on AI messages is sophisticated
- Dark theme good for late-night check-ins
- **Recommendation**: Keep pulse animation, apply to light theme variant

---

### 2. AI Learning Progression & Messaging

**Best Feature: Three-Phase System** (from first_run_7day_journey)
- **Seed Phase (Days 1-2)**: "Observing" - AI gathering baseline
- **Learn Phase (Days 3-5)**: AI detects patterns, begins suggestions
- **Act Phase (Day 6+)**: Strong recommendations, domain unlocks
- Clear user mental model of progression
- **Recommendation**: Implement explicitly in merged version

**Strong Feature: Narrative Arc** (from life_os_onboarding_week1)
- Day 2: "I'm still building your picture"
- Day 3: "I noticed something already"
- Day 4: "Getting clearer. I have enough to make a first real suggestion"
- Day 5: "Something new today. I want to make a change — but only with your permission"
- Day 7: "One week in. I know you well enough now"
- Creates emotional connection and trust
- **Recommendation**: Weave narrative into phase-based structure

---

### 3. AI Context & Confidence Building

**Best Feature: Explicit Confidence Tiers** (from first_run_7day_journey)
- 4-tier confidence system:
  - Observe (0-33%)
  - Suggest (34-66%)
  - Recommend (67-85%)
  - Act (86-100%)
- Shows concrete progress toward full personalization
- Per-category breakdowns (Focus: 82%, Reflection: 58%, etc.)
- **Recommendation**: Add confidence tiers to all suggestion cards

**Strong Feature: Context Card Evolution** (from life_os_onboarding_week1)
- Day 3: 3 data points
- Day 6: 5 data points with "new" badges
- Shows visible progress in what AI knows
- **Recommendation**: Implement as rolling context summary

---

### 4. Pattern Detection & Suggestions

**Best Feature: Multi-Source Suggestion Timing** (from first_run_7day_journey)
- Day 4: First single suggestion (Focus 44%)
- Day 5: Two simultaneous suggestions (Reflection 65%, Tasks 38%)
- Day 6: Strong recommendation (Focus 82%) + new domain
- Graduated complexity - more suggestions as confidence increases
- **Recommendation**: Follow this timing in merged version

**Strong Feature: Approval-First Design** (from life_os_onboarding_week1)
- Day 5 proposal shows what will be added before committing
- Details: "Prayer + devotional + Bible reading, 6:00–6:45 AM, Mon–Fri"
- Approval creates sense of control vs. imposition
- **Recommendation**: All suggestions require explicit approval with preview

---

### 5. Domain Setup & Activation

**Best Feature: Progressive Domain Unlock** (from life_os_onboarding_week1 + first_run_7day_journey)
- Day 1: User activates first domain (optional, encouraged)
- Day 4: Finance domain unlock card
- Day 4: Health domain unlock card
- Day 6: Relationships domain unlock card
- Spaced progression based on AI understanding
- **Recommendation**: Show domain cards only when AI is ready to help

**Feature: Setup vs. Activate Labels** (from life_os_onboarding_week1)
- "+ Setup" for configuration-heavy domains (Finance, Relationships)
- "+ Activate" for quick-start domains (Health, Career)
- Clear signal of commitment level
- **Recommendation**: Differentiate domain setup paths

---

### 6. Check-in & Reflection

**Best Feature: Detailed Slider Interface** (from activity_bottom_sheets)
- Large 36px height sliders (easy thumb target)
- Real-time value display (large, teal colored)
- Descriptive tick labels (Low/Okay/Neutral/Good/Great for mood)
- Separate CI rows with clear labeling
- **Recommendation**: Use as standard check-in form

**Strong Feature: Prompt Context** (from activity_bottom_sheets)
- Reflection prompt shown inside sheet: "You said follow-through is your biggest obstacle..."
- Contextualizes why this reflection matters
- **Recommendation**: Always provide context for reflection prompts

---

### 7. Activity Execution & Timers

**Best Feature: Ring Timer with Countdown** (from activity_bottom_sheets)
- SVG circular progress ring (140px diameter)
- Large serif timer display (32px "Instrument Serif")
- Three-state controls: Start/Pause/Resume, Reset
- Status label changes (ready → running → paused → complete)
- **Recommendation**: Implement as primary timer interaction

**Strong Feature: Post-Activity Rating** (from activity_bottom_sheets)
- After completion: "How useful was this?" + "How hard was it?"
- Pill-based selection with visual feedback
- Adds +10 confidence to reflection category
- **Recommendation**: Required after each core activity

---

### 8. Component Patterns

**Best Feature: Activity Card Structure** (all files, optimized in activity_bottom_sheets)
```
┌─────────────────────────────────┐
│ [Icon] Title          [Status]  │  ← act-head
├─────────────────────────────────┤
│ Description                     │  ← act-body
│ [Primary Action] [Ghost Action] │
└─────────────────────────────────┘
```
- Consistent across all activities
- Status toggle area for completion
- Flexible body content

**Best Feature: Suggestion Card** (from first_run_7day_journey)
- AI confidence badge visible in eyebrow
- Full-width text explanation
- 3-action buttons: Accept / Dismiss / Snooze
- Color-coded by confidence tier

---

### 9. Typography & Spacing

**Best Feature: Serif Headlines + Sans Body** (from first_run_7day_journey & activity_bottom_sheets)
- Headlines: "Instrument Serif" (22-32px, italic variants available)
- Body/UI: "Inter" (12-14px for readability)
- Creates hierarchy without overwhelming
- **Recommendation**: Use this system (already imported in light theme files)

**Best Feature: Tight Vertical Rhythm** (from all files)
- 4-6px padding within elements
- 8-12px margins between sections
- 14-20px gaps in flex containers
- Predictable, easy to scan

---

### 10. Interactive Elements & Feedback

**Best Feature: Hover & Click Feedback** (from activity_bottom_sheets)
- Primary buttons: Solid fill (dark), hover: darker shade (-0.5px brightness)
- Ghost buttons: Border + text only, hover: background tint + darker border
- Sliders: Dynamic value updates in real-time
- Subtle transitions (all .2s cubic-bezier)
- **Recommendation**: Use this consistent interaction model

**Best Feature: Ring Toggle States** (from life_os_onboarding_week1)
- Empty ring: just outline
- Hover: subtle cursor pointer
- Selected: filled + checkmark
- Color-coded by domain
- **Recommendation**: Implement for habit/task toggles

---

## Gaps & Redundancies

### Gaps (Missing from all files)

1. **First-Time Domain Selection** - No explicit "choose your domains" flow on Day 1
   - Assumption: Users discover domains organically through suggestions
   - Risk: Some domains never activated if user doesn't match patterns

2. **Suggested Starting Actions After Domain Activation** - Not shown
   - What should user do immediately after unlocking Finance?
   - No onboarding sequence within new domain
   - Gap: First experience in new domain is empty

3. **AI Confidence Visualization** - Different approaches, inconsistency
   - life_os: Progress bar %
   - first_run: Per-category confidence scores + tiers
   - activity_bottom_sheets: Doesn't show confidence

4. **Long-Form Learning** - No "explain what you learned" flows
   - Day 7 in life_os: "Walk me through what the AI learned about me this week" button
   - Not implemented as sheet; flows into main planner
   - Missing detailed explanation UI

5. **Habit Streaks & Milestones** - Only visual celebration (emoji, no mechanics)
   - Day 6: "5-day check-in streak" 🔥
   - No streak counter, no reward mechanics
   - Missing: streak loss protection, recovery paths

### Redundancies

1. **Multiple Progress Representations**
   - life_os: Single linear progress bar
   - first_run: Progress bar + phase pills + day indicators
   - activity_bottom_sheets: None (implied in day tabs)
   - Recommendation: Use day indicators + phase pills (first_run approach)

2. **Domain Unlock Cards**
   - life_os: Multiple cards (Finance, Health, Relationships)
   - first_run: Separate "unlock-card" component
   - Both serve same function, slightly different visual weight
   - Recommendation: Standardize to single component

3. **Suggestion Presentation**
   - life_os: suggestion-card with OK/Not-yet buttons
   - first_run: sug-card with Accept/Dismiss/Snooze buttons
   - activity_bottom_sheets: Implicit (not shown)
   - Recommendation: Use three-button model (Accept/Dismiss/Snooze)

---

## Final Recommendation: Merge Strategy

### Architecture: "Light Theme Narrative + Confidence-Driven Learning"

The final design should:
- Use **light theme** (cream, Instrument Serif + Inter)
- Implement **three-phase system** (Seed/Learn/Act)
- Show **per-category confidence** with tiered badges
- Weave **narrative arc** through AI messages
- Use **sheet-based modals** for activity execution
- Include **approval-first suggestions** with live preview
- Progressive **domain unlocks** based on AI readiness

---

## Merge Strategy: Specific Implementation Steps

### Phase 1: Foundation (Days 1-2 — Seed Phase)

**Screen Structure:**
```
[Header] Day 1 · Seed phase | "Good morning, Sam" | [Observing] pill
[Scroll Area]
  └─ First message (amber insight card)
  └─ Progress card (14% fill, day indicators)
  └─ Check-in activity card
  └─ Write 3 priorities activity card
  └─ Focus block activity card
  └─ Domain unlock cards (Career, Health)
  └─ Confidence card (Observe tier for all)
```

**Components to Preserve:**
- **From first_run_7day_journey:**
  - Phase pill styling (amber for Seed)
  - Insight card with eyebrow + text + confidence context
  - Progress card with day indicators
  - Unlock cards
  - Confidence card with per-category breakdown

- **From activity_bottom_sheets:**
  - Activity card structure (icon + title + meta + status)
  - Sheet modals for each activity (check-in, priorities, focus block)
  - Post-activity rating sheets

- **From life_os_onboarding_week1:**
  - Greeting section (day + title + subtitle)
  - Day chip label styling
  - Narrative tone in first message

**AI Message (Day 1):**
```
"You said you want to get more done each day. Let's start with
something small — three focused tasks. I'll watch what works."
[Confidence Indicator: Observing · Fresh start]
```

---

### Phase 2: Pattern Recognition (Days 3-4 — Transition to Learn)

**Day 3 Screen:**
```
[Header] Day 3 · Learn phase | "Patterns emerging" | [Learning] pill
[Scroll Area]
  └─ First insight card (purple, threshold explanation)
  └─ Evening check-in card (sliders)
  └─ Progress card (43% fill)
  └─ Activity cards (Focus completed, Evening wind-down)
  └─ Confidence card (higher scores, some Suggest tier)
```

**Day 4 Screen:**
```
[Header] Day 4 · Learn phase | "First real suggestion" | [Learning] pill
[Scroll Area]
  └─ Suggestion card (purple, Accept/Dismiss/Snooze)
  └─ Progress card (57% fill)
  └─ Activity cards
  └─ Unlock card (Finance domain)
  └─ Confidence card (2 categories in Recommend tier)
```

**Components to Preserve:**
- **Phase pill changes to purple** (Learn)
- **Suggestion card:**
  - Eyebrow: "AI suggestion" + confidence badge
  - Text: Full reasoning
  - 3-button footer: Accept/Dismiss/Snooze
  - Background: Purple tinted

- **Insight card (Day 3):**
  - Shows what AI detected + confidence threshold crossed
  - Example: "Reflection ≥ 31"

**Confidence Tiers:**
- Observe (0-33%): "Just getting started"
- Suggest (34-66%): "Data building" / "Ready to suggest"
- Recommend (67-85%): "Learning phase"
- Act (86-100%): "Strong recommendation"

---

### Phase 3: Action & Approval (Days 5-6 — Full Learn → Act Transition)

**Day 5 Screen:**
```
[Header] Day 5 · Learn phase | "AI is getting sharp" | [Learning] pill
[Scroll Area]
  └─ First suggestion card (Reflection 65%, purple)
  └─ Second suggestion card (Tasks 38%, amber-tinted)
  └─ Progress card (71% fill)
  └─ Activity cards
  └─ Confidence card (3 categories Recommend tier)
```

**Day 6 Screen:**
```
[Header] Day 6 · Act phase | "Streak celebration" | [Acting] pill
[Scroll Area]
  └─ Insight card (teal, "Act phase unlocked" message)
  └─ Progress card (86% fill)
  └─ Strong recommendation card (teal, Focus 82%)
  └─ Streak celebration box (emoji + message + stats)
  └─ Unlock card (Relationships domain)
  └─ Confidence card (4-5 categories Recommend/Act tier)
```

**Components to Preserve:**
- **Multiple suggestions:** Day 5 shows 2 simultaneous (can be different tiers)
- **Suggestion card color variation:** Purple for Reflection, Amber for Tasks, Teal for strong Act-phase
- **Streak celebration:**
  - Gradient background (from life_os)
  - Emoji (🔥)
  - Title: "5-day [activity] streak"
  - Subtitle with explanation

---

### Phase 4: Full Personalization (Day 7 — Complete)

**Day 7 Screen:**
```
[Header] Day 7 · Act phase | "One week in, [Name]" | [Complete] pill
[Scroll Area]
  └─ Week summary card (stats: 7 check-ins, 6 prayer days, 14 tasks, 1 approval)
  └─ Progress card (100% fill, all days done)
  └─ AI ready message (green insight, "Week 2 plan ready")
    - "Open week plan" button
    - "What you learned" button (opens explanation flow)
  └─ Confidence card (all categories Recommend+ tier)
```

**Components to Preserve:**
- **Week summary card:**
  - Title: "Your first week"
  - Stats grid (4 columns with emoji, number, label)
  - Summary text pulling from data
  - All from life_os_onboarding_week1

**AI Message:**
```
"I've generated your first full personalised week plan. It's built
around your real patterns — not templates. Review it, adjust it,
and approve what fits. This is how every week will start from now on."
[Confidence: Complete ✓]
```

---

## Sheet Modal Specifications

All activities trigger sheet modals. Each sheet has:

### Structure
```
[Handle Bar]
[Header: Icon + Title + Meta + Close Button]
[Body: Input/Config Content]
[Footer: Primary CTA + Ghost Action]
```

### Sheets to Implement

1. **Check-in Sheet**
   - 3 sliders: Mood, Energy, Readiness (1-5)
   - Descriptive labels at each tick mark
   - Submit button (teal)
   - Skip option
   - Fires: `recordActivityEvent(action: "started")` → `recordActivityEvent(action: "completed")`

2. **Write 3 Priorities Sheet**
   - Contextual intro text
   - 3 input rows with numbering (1, 2, 3)
   - Placeholder text
   - Save button
   - Post-save → Rating sheet

3. **Focus Block Sheet**
   - Input: "What are you working on?"
   - Ring timer (140px diameter, 25:00)
   - Start/Pause/Reset controls
   - Timer state labels (ready → running → complete)
   - "Mark complete" button
   - Post-complete → Rating sheet

4. **Reflect on Blocker Sheet**
   - Context prompt (amber highlight box)
   - Large textarea (100px min-height)
   - "Save reflection" button
   - Post-save → Rating sheet

5. **Post-Activity Rating Sheet**
   - "How useful was this?" (Useful/Meh/Not really)
   - "How hard was it?" (Easy/Medium/Hard)
   - Pill selection with toggle state
   - "Submit feedback" button
   - Fires: `recordActivityReflection` (+10 confidence to reflection)

---

## Domain Setup Flows

After domain unlock, user taps card → shows setup sheet:

### Finance Domain Setup Sheet
```
[Header] Finance | "Set up budget"
[Body]
  - Contextual message: "Track spending against a monthly cap"
  - Budget input field (currency, locale-aware)
  - Transaction category selector (optional)
[Footer]
  - "Set budget" primary button
  - "Skip for now" secondary
```

### Health Domain Setup Sheet
```
[Header] Health | "Log first session"
[Body]
  - Activity type selector (Walk, Run, Strength, etc.)
  - Duration input
  - Date/time picker
  - How you felt (slider 1-5)
[Footer]
  - "Log & activate" primary button
```

### Relationships Domain Setup Sheet
```
[Header] Relationships | "Add someone"
[Body]
  - Name input
  - Relationship type selector
  - Frequency of interaction (weekly/monthly/custom)
  - Why they matter (textarea)
[Footer]
  - "Add person" primary button
```

---

## Preserved Features Summary

### Visual Design
- [x] Light theme (cream background #FAFAF8)
- [x] Instrument Serif headings + Inter body
- [x] Relaxed spacing (14-20px gaps)
- [x] 4-color semantic palette (purple/teal/amber/green)
- [x] Consistent padding rhythm (4-6px inner, 14-20px outer)

### AI Learning
- [x] Three-phase system (Seed/Learn/Act with phase pills)
- [x] Per-category confidence scores with 4 tiers
- [x] Narrative arc ("still building" → "patterns emerging" → "getting sharp")
- [x] Context cards showing what AI knows
- [x] Insight cards with confidence threshold explanations

### Patterns & Suggestions
- [x] Day 4 first suggestion
- [x] Day 5 multiple suggestions
- [x] Day 6 strong recommendation
- [x] Approval-first with 3 actions (Accept/Dismiss/Snooze)
- [x] Confidence badges on suggestion cards

### Activities
- [x] Check-in with 5-point sliders (descriptive labels)
- [x] Write 3 priorities with numbered inputs
- [x] Focus block with ring timer
- [x] Reflection/blocker prompts with context
- [x] Post-activity rating sheets
- [x] Skip options for all activities

### Domain System
- [x] Progressive unlock based on AI readiness
- [x] Setup vs. Activate labeling
- [x] Domain unlock cards with icons
- [x] Domain activation flows (sheets)

---

## Implementation Checklist

### HTML/CSS Structure
- [ ] Consolidate color tokens from first_run_7day_journey
- [ ] Create phase pill component (seed/learn/act states)
- [ ] Implement ring timer SVG with progress
- [ ] Sheet modal overlay + animation
- [ ] Activity card component (reusable)
- [ ] Suggestion card component (color-variant based)
- [ ] Confidence card component (per-category breakdown)

### JavaScript/Interactivity
- [ ] Day navigation (tabs or scroll-based)
- [ ] Sheet open/close with overlay
- [ ] Timer start/pause/reset logic
- [ ] Slider value updates (real-time display)
- [ ] Rating pill selection toggle
- [ ] Phase transition logic (trigger Act phase on Day 6)
- [ ] Activity status tracking (completed/skipped/pending)

### Content Structure
- [ ] 7-day message templates with narrative arc
- [ ] Day-by-day confidence progression curves
- [ ] Suggestion timing schedule
- [ ] Domain unlock sequence
- [ ] Localized timezone for greetings

### Design Polish
- [ ] Hover/focus states for all interactive elements
- [ ] Loading states for async operations
- [ ] Empty states for new activities
- [ ] Error handling for sheet actions
- [ ] Accessibility: ARIA labels, semantic HTML, color contrast

---

## Key UX Principles to Preserve

1. **Progressive Disclosure** - New features unlock as AI confidence grows
2. **Approval First** - User never surprised by AI changes; always review before applying
3. **Visible Progress** - Confidence scores, day indicators, phase pills all show forward momentum
4. **Narrative Trust** - AI explains its reasoning; acknowledges uncertainty in early days
5. **Flexible Engagement** - Every activity has a "Skip" option; no forced participation
6. **Quick Actions** - Most activities under 10 minutes; sliders before complex forms
7. **Clear Next Steps** - Each day ends with visible suggested action for user

---

## Notes for Implementation Team

### Design System Token Recommendations

```css
:root {
  /* Colors - from first_run_7day_journey */
  --bg: #FAFAF8;
  --surf: #FFFFFF;
  --border: #E8E6E1;
  --text: #1C1B18;
  --muted: #8A8780;
  --hint: #C8C5BE;

  /* Phase colors */
  --phase-seed: #9A6B1A;      /* Amber */
  --phase-learn: #6B5ECD;      /* Purple */
  --phase-act: #2A7A6F;        /* Teal */

  /* Semantic */
  --success: #2D6A4F;          /* Green */
  --warning: #9A6B1A;          /* Amber */

  /* Animations */
  --transition: all .2s cubic-bezier(.4, 0, .2, 1);
}
```

### Font Imports
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap');
```

### Responsive Considerations
- Phone width: 375px (fixed, not responsive)
- Side panel hidden on mobile
- Touch-friendly tap targets: 44px minimum
- Safe area padding: 20-22px sides (status bar safe)

---

## Success Metrics for Merged Design

After implementation, measure:

1. **Engagement**: % of users reaching Day 3 (pattern detection)
2. **Approvals**: % of Day 5 suggestions users accept
3. **Completion**: % of users completing full 7-day onboarding
4. **Domain Activation**: % of users unlocking secondary domains
5. **Activity Consistency**: % of users completing all 3 core activities daily
6. **Confidence Tracking**: Does confidence growth match user satisfaction?
7. **Suggestion Quality**: Acceptance rate of AI suggestions (target: 70%+)

---

## Appendix: File Locations

- **File 1**: `/home/develophantom/dev/sc/seile/apps/native/ui/onboarding/life_os_onboarding_week1.html`
  - 420 lines, dark theme, narrative-driven, 7 discrete day screens

- **File 2**: `/home/develophantom/dev/sc/seile/apps/native/ui/testings/first_run_7day_journey.html`
  - 700+ lines, light theme, phase-based, day tabs, confidence metrics

- **File 3**: `/home/develophantom/dev/sc/seile/apps/native/ui/testings/activity_bottom_sheets.html`
  - 588 lines, light theme, sheet modals, detailed activity flows, timers, ratings

---

## Conclusion

The merged design combines:
- **Life_os's** narrative arc and emotional progression
- **First_run's** phase system and explicit confidence metrics
- **Activity_sheets's** detailed execution flows and post-activity feedback

This creates a cohesive, trustworthy onboarding experience where users see the AI learning in real-time, understand what it knows, and maintain full control over suggestions before they're applied.

**Estimated implementation timeline**: 2-3 weeks for full markup, styling, and interactivity.
