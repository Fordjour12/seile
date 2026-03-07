#  React Native Scheduler Feature

## Project Overview

Build a ** scheduler feature ** for managing all activities, tasks, and timed sessions in the app. The scheduler is the central hub for task management — it handles one-time tasks, recurring tasks, timed sessions, overdue tracking, dependency chains between tasks, and pushes timely notifications to the user when tasks are due or overdue.

The UI must feel native, clean, and polished — consistent with a dark-first design system using the token file described below. Every screen, sheet, and interaction should feel intentional and premium.

NOTE: correct all assumptions that does not align with the application previous model which is important to have a consistant application flow

---

## Tech Stack

- **Notifications:** `expo-notifications` 
- **Date handling:** `date-fns`
- **State:** Zustand (preferred) or React Context + useReducer
- **Animations:** React Native Reanimated 
- **Calendar base:** Custom-built (no third-party calendar lib)


---

## Design System
use the design token  and systems we have in the application already **@/components** and ** @/lib/constants**


---

## Data Model
This data model needs work  because it should convex  scheama.

### Task
```ts
type Task = {
  id: string;                        // uuid
  title: string;
  notes: string;
  status: "todo" | "in_progress" | "done" | "overdue";
  priority: "low" | "medium" | "high";
  dueDate: string;                   // ISO date "YYYY-MM-DD"
  time: string | null;               // "HH:MM" 24h or null
  recur: "none" | "daily" | "weekly" | "monthly";
  deps: string[];                    // array of Task IDs this task depends on
  subtasks: Subtask[];
  createdAt: string;                 // ISO datetime
  completedAt: string | null;
  notificationId: string | null;     // expo-notifications scheduled ID
};

type Subtask = {
  id: string;
  title: string;
  done: boolean;
};
```

### Scheduler State
```ts
type SchedulerState = {
  tasks: Task[];
  selectedDate: string;              // ISO date currently focused in calendar
  activeView: "month" | "week" | "day" | "agenda";
  activeTab: "calendar" | "tasks" | "alerts";
  filter: "all" | "overdue" | "today" | "upcoming";
};
```

---

## Features to Build

### 1. Scheduler Screen (main screen)

The root screen. Full-screen layout with three zones:

**A. Header**
- App title "Scheduler" 
- Current date subtitle 
- Overdue badge: red pill showing count, only visible when count > 0
- Stats row: 3 equal cards showing Overdue / Today / Upcoming counts with colored backgrounds

**B. Tab Bar** (below header, above body)
- Three tabs: `📅 Calendar` | `✅ Tasks` | `🔔 Alerts`
- Active tab: white text + bottom border in C.primary
- Tabs sit flush against header, body scrolls below

**C. Body** — controlled by active tab (see sections below)

**FAB (Floating Action Button)**
- Fixed bottom-right, 52×52px, radius=16
- Gradient background: `linear-gradient(135deg, #7C6EFA, #A78BFA)`
- Box shadow: `0 8px 24px #7C6EFA55`
- Opens Add Task bottom sheet on press

---

### 2. Calendar Tab

#### View Switcher
- 4 pill buttons: Month / Week / Day / Agenda
- Active: C.primary background, white text
- Inactive: transparent background, C.textSub text
- Contained in a surface-colored rounded pill container

#### Month View
- 7-column grid, Sunday–Saturday
- Day header row: 3-letter day labels, C.textSub, 10px, uppercase
- Each cell: min-height 52px, radius 8
  - Today: subtle C.primary tinted background + border
  - Selected: stronger C.primary tint + C.primary border
  - Other month: 35% opacity
- Task dots: up to 3 dots per cell (5px circles)
  - Overdue tasks → C.danger dot
  - Non-overdue → color from task priority
- Tap a day → sets selectedDate, shows task list card below grid

**Selected Day Task List** (below grid, only in Month/Week view):
- Card header shows selected date ("Today" or formatted date)
- Lists all TaskRow components for that day

#### Week View
- Horizontal timeline grid
- Column per day (7 columns), rows per hour (8am–8pm)
- Day header: 3-letter abbreviation + date number
  - Today highlighted in C.primary
  - Tap a column header → switch to Day view for that date
- Hour labels: left column, 10px, C.textSub, "8am", "9am" … "8pm"
- Task chips: appear in their timed slot row
  - Background: priority color at 20% opacity
  - Left border: 2px solid priority color
  - Font: 9px 600, colored text
  - Overflow hidden with ellipsis

#### Day View
- Same as Week but single column
- Full width for the single day

#### Agenda View
- Scrollable list of upcoming 14 days (starting 2 days ago)
- Skip days with no tasks entirely
- Date section header: "Today" or "Mon, Jan 6", 11px 700 uppercase C.textSub
- Each task renders as a TaskRow

---

### 3. Tasks Tab

**Filter row** (horizontal scroll, pill buttons):
- All | Overdue (shows count badge) | Today | Upcoming
- Active: C.primary background
- Inactive: C.surface background, C.border border

**Task List:**
- All tasks matching the active filter
- Renders `TaskRow` components
- Empty state: centered emoji + "No tasks here 🎉" message

---

### 4. Alerts Tab

Three sections, each only rendered if non-empty:

**🔴 OVERDUE** — alert cards with C.danger tinting
- Section label: "🔴 OVERDUE" in C.danger, 12px 700 uppercase
- Each card: danger-tinted background + border, ⚠️ icon, task title, "Was due YYYY-MM-DD", priority tag

**🟡 DUE TODAY** — alert cards with C.warning tinting
- Section label: "🟡 DUE TODAY" in C.warning
- Each card: warning-tinted, 📋 icon, task title, time if set, dependency count if any

**🟢 COMING UP** — tasks due within 3 days
- Section label: "🟢 COMING UP" in C.success
- Each card: success-tinted, ⏳ icon, task title, due date

**Empty state** (all clear):
- Centered ✅ emoji, "All clear!" heading, "No alerts at the moment" subtitle

---

### 5. Shared Components

#### TaskRow
Used in all list contexts. Tappable — opens Task Detail sheet.

Layout (horizontal):
```
[PriorityBar] [Content: title + meta + progress] [Date/Status]
```

- **PriorityBar:** 3 stacked rects (4px wide × 14px tall each, 2px gap), filled up to current priority level using priority color
- **Title:** 14px 600, strikethrough + C.muted if done
- **Meta row:** status tag + recurrence tag (if set) + time (if set) + dep count (if set)
- **Progress bar:** only shown if subtasks exist — thin 4px bar, C.primary fill, percentage label
- **Date:** right-aligned, 11px — shows "Overdue" in C.danger or "MM/DD"
- Overdue tasks: entire row has C.danger tinted background + border

#### Tag Component
```
[label]
```
- Pill shape (radius full)
- Background: `color + "22"` (13% opacity)
- Border: `color + "44"` (26% opacity)
- Text: color, 11px 600, letterSpacing 0.3
- Two sizes: default (3px 9px padding) and small (2px 7px padding)

#### PriorityBar Component
Three stacked rectangles (4×14px, 2px gap):
- Low: fill 1 rect
- Medium: fill 2 rects
- High: fill 3 rects
- Filled color = priority color, unfilled = C.border

#### Progress Component
Only rendered when subtasks.length > 0:
- Thin track bar (4px height, C.border background)
- Fill: C.primary, animated width transition
- Right label: "N%" in 10px C.textSub

---

### 6. Task Detail Bottom Sheet

Opens when tapping any task anywhere. Slides up from bottom.

**Layout:**
- Handle bar at top (40px wide, 4px tall, C.border, centered)
- Overlay: semi-transparent backdrop with blur, tap to dismiss
- Sheet: C.card background, radius modal (24px) top corners, max-height 85vh, scrollable

**Sections (top to bottom):**

1. **Header row**
   - Task title (17px 700)
   - Status tag + Priority tag + Recurrence tag (if set)
   - "✓ Done" button (primary style) — only shown if status !== done

2. **Due date row**
   - "DUE DATE" label (12px 600 C.textSub uppercase)
   - Value: date + time if set, C.danger if overdue

3. **Status selector**
   - Row of 4 pill buttons: To Do / In Progress / Done / Overdue
   - Active: colored tinted background matching status color
   - Tapping updates task status

4. **Subtasks section** (only if subtasks.length > 0)
   - "SUBTASKS" label
   - Progress bar at top
   - List of checkbox rows: native checkbox (accentColor = C.primary) + title
   - Done subtasks: strikethrough + C.muted

5. **Dependencies section** (only if deps.length > 0)
   - "DEPENDS ON" label
   - Each dep task: colored dot + task title + status tag
   - Tap → opens that task's detail sheet

6. **Notes**
   - "NOTES" label
   - Multiline text input, saves onBlur

7. **Delete button** (danger style, left-aligned, small)

---

### 7. Add Task Bottom Sheet

Opens from FAB. Same sheet structure as Detail.

**Fields:**
1. **Title** — text input, autofocused, placeholder "Task title…"
2. **Due Date** — date picker (native DateTimePicker or custom)
3. **Time** (optional) — time picker, placeholder "No time set"
4. **Priority** — 3 pill buttons (Low / Medium / High), colored when selected
5. **Recurrence** — 4 pill buttons (Once / Daily / Weekly / Monthly), C.accent when selected

**Actions:**
- Cancel (secondary) + Add Task (primary, disabled when title empty)
- On submit: create task, schedule notification, close sheet

---

### 8. Notifications

Schedule a local notification for every task that has a due date (and time if set).

**Rules:**
- If task has a `time`: schedule notification at that exact datetime
- If task has no `time`: schedule notification at 9:00 AM on the due date
- Notification title: task title
- Notification body:
  - Same-day: "Due today" or "Due at HH:MM"
  - Future: "Due on MMM D"
- Cancel and reschedule notification whenever due date/time is edited
- Cancel notification when task is marked done or deleted

**Overdue check on app launch:**
- On every app open, scan all tasks
- Any task where `dueDate < today` and `status !== done` → set `status = "overdue"`
- Trigger a grouped notification if overdue count > 0:
  - Title: "You have N overdue tasks"
  - Body: list first 3 titles

**Recurring task auto-generation:**
- When a recurring task is marked done, automatically create the next occurrence:
  - daily → +1 day
  - weekly → +7 days
  - monthly → +1 month (same day)
- New task copies all fields except: new ID, new dueDate, status = "todo", completedAt = null

---

### 9. Persistence

- All tasks stored in AsyncStorage (or MMKV) under key `"scheduler_tasks"`
- Persist and rehydrate on app launch
- Zustand with `persist` middleware is the recommended pattern:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useSchedulerStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => set(s => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, patch) => set(s => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t)
      })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
    }),
    { name: "scheduler_tasks", storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

---

## Screen Architecture

```
App
├── NavigationContainer
│   └── Tab.Navigator (bottom tabs — hide if only one screen)
│       └── Stack.Navigator
│           └── SchedulerScreen          ← main screen
│               ├── Header
│               │   ├── TitleRow
│               │   ├── StatsRow
│               │   └── TabBar
│               └── Body (ScrollView)
│                   ├── CalendarTab
│                   │   ├── ViewSwitcher
│                   │   ├── CalendarCard
│                   │   │   ├── NavRow
│                   │   │   ├── MonthGrid | WeekTimeline | DayTimeline | AgendaList
│                   │   └── SelectedDayTaskList (month/week only)
│                   ├── TasksTab
│                   │   ├── FilterRow
│                   │   └── TaskList → TaskRow[]
│                   └── AlertsTab
│                       ├── OverdueSection
│                       ├── TodaySection
│                       └── UpcomingSection
├── FAB (absolute positioned)
├── TaskDetailSheet (conditional, Portal)
└── AddTaskSheet (conditional, Portal)
```

---

## Interaction & Animation Details

- Bottom sheets: slide up with `Reanimated` spring animation
  - Config: `{ damping: 26, stiffness: 280, mass: 1 }`
- Sheet backdrop: fade in opacity 0 → 0.6
- Task row press: scale to 0.98, opacity to 0.84 (Reanimated)
- Calendar cell press: background flash
- Status button tap: color cross-fade 150ms
- FAB: subtle pulse animation when overdue count > 0
- Filter pill: background transition 150ms
- Progress bar: `width` animated with `withTiming(pct, { duration: 300 })`
- View switcher: smooth background slide between active pill

---

## Edge Cases to Handle

1. **Task with unmet dependencies** — show a warning in detail sheet if any dep task is not done
2. **Recurring task with no end** — always generate exactly one next occurrence on completion
3. **Date rollover on app open** — re-evaluate all task statuses on `AppState` change to "active"
4. **Empty states** — every list must have a non-generic empty state with emoji + message
5. **Long task titles** — truncate at 2 lines in TaskRow, full title in detail sheet
6. **No time set tasks** — never show in timeline views; only appear in month dots and agenda
7. **Notification permissions** — request on first launch, gracefully degrade if denied (no crash, just skip scheduling)
8. **Subtask progress vs status** — task status is independent of subtask completion (user controls status manually)

---

## File Structure

```
/src
  /(tabs)
    scheduler/
      _layout.tsx
      create.tsx
      index.tsx
      [id]/
        _layout.tsx
        index.tsx
        update.tsx
        delete.tsx
  /components
    TaskRow.tsx
    TaskDetailSheet.tsx
    AddTaskSheet.tsx
    CalendarMonth.tsx
    CalendarWeek.tsx
    CalendarDay.tsx
    CalendarAgenda.tsx
    Tag.tsx
    PriorityBar.tsx
    Progress.tsx
    StatsRow.tsx
    AlertCard.tsx
    FAB.tsx
    lib/
    /store
      useSchedulerStore.ts
    /utils
      notifications.ts       ← schedule / cancel helpers
      taskHelpers.ts         ← isOverdue, getNextRecurrence, etc.
      dateHelpers.ts         ← fmtDate, addDays, isSameDay, etc.
    /hooks
      useOverdueCheck.ts     ← runs on AppState change
```

---

## Seed / Test Data

Seed the store with these tasks for development and testing:

| Title | Due Offset | Priority | Recur | Deps | Subtasks | Time |
|---|---|---|---|---|---|---|
| Design system review | -2 days | high | none | — | Review typography, Check spacing, Validate colors | — |
| Sprint planning | -1 day | high | weekly | — | — | — |
| Push notifications setup | today | high | none | [Design system review] | Configure FCM, Test Android, Test iOS | 10:00 |
| Write unit tests | +1 day | medium | none | [Push notifications setup] | Auth module, Scheduler module | — |
| Team standup | today | low | daily | — | — | 09:00 |
| Release v1.2 | +3 days | high | none | [Write unit tests] | Tag release, Update changelog, Deploy | — |
| Monthly report | +5 days | medium | monthly | — | — | — |
| UX review session | +2 days | medium | none | — | — | 14:00 |

Negative offsets should auto-set status to `"overdue"` on seed.

---

## Definition of Done

The build is complete when:
- [ ] All 4 calendar views render correctly with real task data
- [ ] Task dots appear on the correct calendar days with correct colors
- [ ] Week and Day timeline renders timed tasks in the right hour slot
- [ ] Tasks tab filter works for all 4 filters
- [ ] Alerts tab shows correct sections with no false positives
- [ ] Task detail sheet opens, edits persist, status changes work
- [ ] Subtask checkboxes update progress bar in real time
- [ ] Add task sheet creates a task and it immediately appears in the correct calendar cell
- [ ] Recurring tasks auto-generate next occurrence on completion
- [ ] Overdue tasks are highlighted red everywhere (row, dots, alerts, stats)
- [ ] Notifications are scheduled on task creation and cancelled on completion/deletion
- [ ] Overdue check runs on every app foreground event
- [ ] All data persists across app restarts
- [ ] No hardcoded colors, spacing, or font sizes — all from tokens
- [ ] All animations use Reanimated 
- [ ] App does not crash when notification permission is denied
