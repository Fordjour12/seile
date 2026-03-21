# Life OS Onboarding — Component Specifications

> Detailed technical specifications for all interactive components used in the 7-day first-run experience. Includes structure, props, CSS classes, and usage patterns.

---

## 1. Activity Card Component

### Purpose

Display a suggested or assigned activity with completion status, metadata, and optional interaction.

### Structure

```html
<div class="act-card" onclick="openActivitySheet('Activity Name')">
  <div class="act-head">
    <div class="act-icon ai-focus">⚡</div>
    <div class="act-info">
      <div class="act-title">Focus block</div>
      <div class="act-meta">25 min • Deep work</div>
    </div>
    <div class="act-status" onclick="toggleStatus(event)">
      <div class="act-status-dot"></div>
    </div>
  </div>
  <div class="act-body">
    <div class="act-desc">Pick one task that matters. Work without distractions.</div>
  </div>
</div>
```

### Props / Data

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `title` | string | Yes | Activity name (14px Inter 500) |
| `category` | enum | Yes | focus, sleep, exercise, tasks, habits, reflection |
| `duration` | number | Yes | minutes |
| `context` | string | No | Secondary label (e.g., "Deep work") |
| `description` | string | No | 2-3 sentence explanation (12px muted) |
| `status` | enum | No | pending, completed, skipped |
| `emoji` | string | No | Defaults by category, can override |

### Icon Mapping

| Category | Emoji | Background | RGB |
|----------|-------|------------|-----|
| focus | ⚡ | --purple-bg | #F0EEFF |
| sleep | 🌙 | #EEF2FF | Light blue |
| exercise | 🏃 | --teal-bg | #E6F5F3 |
| tasks | 📋 | --amber-bg | #FDF3E0 |
| habits | 🌱 | --green-bg | #E8F5EE |
| reflection | 🪞 | --surf3 | #EFEEED |

### States

#### Pending (default)

```html
<div class="act-status">
  <div class="act-status-dot"></div>
</div>
```

- 22px circle
- Border: 1.5px `--border2`
- Hover: background `--surf2`

#### Completed

```html
<div class="act-status done">
  <div class="act-status-dot"></div>
</div>
```

- Background: `--green` (#2D6A4F)
- Border: `--green`
- Content: `::after` with '✓' (11px white)

#### Skipped

```html
<div class="act-status skipped">
  <div class="act-status-dot"></div>
</div>
```

- Background: `--surf3`
- Border: `--border2`
- Content: `::after` with '—' (11px `--hint`)

### Status Toggle Behavior

```javascript
function toggleStatus(event) {
  event.stopPropagation(); // Prevent card click
  const status = event.currentTarget;
  status.classList.toggle('done');
  // Log signal: { action: 'completed', category: ... }
  // Emit rating sheet if completing
}
```

**Logic:**
1. Click status circle
2. Toggle between pending and done
3. On completion → show rating sheet (feedback loop)
4. Write signal to backend with activity ID

### CSS Classes

```css
.act-card { /* Base card, clickable */ }
.act-card:hover { /* Light shadow */ }
.act-head { /* Flex row: icon, info, status */ }
.act-icon { /* 36x36 rounded, centered emoji */ }
.act-info { /* Flex col: title, meta */ }
.act-body { /* Padding, description only */ }
.act-status { /* 22x22 circle */ }
.act-status.done { /* Completed state */ }
.act-status.skipped { /* Skipped state */ }
.ai-focus { /* Background color */ }
.ai-sleep { /* Background color */ }
.ai-exercise { /* Background color */ }
.ai-tasks { /* Background color */ }
.ai-habits { /* Background color */ }
.ai-reflection { /* Background color */ }
```

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Card tap (not status) | Open activity sheet (timer, details, start button) |
| Status circle tap | Toggle done/pending, emit feedback sheet |
| Swipe left (mobile) | Reveal skip/delete (optional) |
| Long press | Show context menu (edit, reschedule, etc.) |

### Accessibility

- `role="button"` on .act-card
- `aria-label="[title]. [duration]. Status: [pending/done]"`
- Status circle has `aria-pressed="false"` (toggle)
- Focus outline on status circle (2px offset)

### Usage Example

```html
<!-- Data from activity assignment -->
<div class="act-card" onclick="openActivitySheet('Morning check-in')">
  <div class="act-head">
    <div class="act-icon ai-habits">🌅</div>
    <div class="act-info">
      <div class="act-title">Morning check-in</div>
      <div class="act-meta">2 min • Start your day</div>
    </div>
    <div class="act-status" onclick="toggleStatus(event)">
      <div class="act-status-dot"></div>
    </div>
  </div>
  <div class="act-body">
    <div class="act-desc">Notice what you're thinking about first. Sit with it.</div>
  </div>
</div>
```

---

## 2. Sheet Modal Component

### Purpose

Slide-up modal for activity details, ratings, setup flows, and confirmations.

### Structure

```html
<div class="rating-sheet" id="activitySheet">
  <div class="sheet-content">
    <button class="sheet-close" onclick="closeSheet('activitySheet')">×</button>
    <div class="sheet-title">Activity Name</div>
    <div class="sheet-sub">Subtitle or context</div>

    <!-- Content goes here -->

    <button class="checkin-btn" onclick="submitAction()">Confirm</button>
  </div>
</div>
```

### Base Classes

```css
.rating-sheet { /* Overlay: fixed, full screen, semi-transparent */ }
.rating-sheet.active { /* Visible state */ }
.sheet-content { /* Bottom sheet: rounded top, slide-up animation */ }
.sheet-close { /* Top-right circle button */ }
.sheet-title { /* Instrument Serif, 20px */ }
.sheet-sub { /* Muted text, 12px */ }
```

### Animation Specs

**Opening:**
- Duration: 0.28s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Keyframe: translateY(100%) → translateY(0)
- Overlay fade: opacity 0 → 1

**Closing:**
- Duration: 0.2s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Keyframe: translateY(0) → translateY(100%)

### Close Behavior

**Methods to close:**
1. Click X button (top-right)
2. Click outside (overlay)
3. Swipe down (mobile)
4. Programmatic: `closeSheet('sheetId')`

**On close:**
- Remove `.active` class
- Reset internal state (clear selected rating, form values)
- Emit analytics event

### Variants

#### Activity Details Sheet

```html
<div class="rating-sheet active" id="activitySheet">
  <div class="sheet-content">
    <button class="sheet-close" onclick="closeSheet('activitySheet')">×</button>
    <div class="sheet-title">Focus block</div>
    <div class="sheet-sub">25 minutes of deep work</div>

    <div class="ring-timer">
      <svg class="ring-svg" viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="54"/>
        <circle class="ring-circle" cx="60" cy="60" r="54"
                style="stroke-dasharray: 339.3; stroke-dashoffset: 85;"/>
        <text class="timer-text" x="60" y="50">21:30</text>
        <text class="timer-label" x="60" y="75">time left</text>
      </svg>
    </div>

    <button class="checkin-btn" onclick="startTimer()">Start timer</button>
    <button style="width:100%; padding:10px; margin-top:8px; border-radius:10px;
                   background:var(--surf2); border:none; color:var(--muted);">
      Skip for now
    </button>
  </div>
</div>
```

#### Rating Sheet

```html
<div class="rating-sheet active">
  <div class="sheet-content">
    <button class="sheet-close" onclick="closeSheet('ratingSheet')">×</button>
    <div class="sheet-title">How did that feel?</div>
    <div class="sheet-sub">Rate this activity (optional)</div>

    <div class="rating-grid">
      <button class="rating-btn" onclick="selectRating(this, 1)">
        <div class="rating-emoji">😤</div>
        <div class="rating-label">Too hard</div>
      </button>
      <!-- ... -->
    </div>

    <button class="checkin-btn" onclick="submitRating()">Save</button>
  </div>
</div>
```

#### Domain Setup Sheet

```html
<div class="rating-sheet active">
  <div class="sheet-content">
    <button class="sheet-close">×</button>
    <div class="sheet-title">Add Finance</div>
    <div class="sheet-sub">Connect your accounts or log manually</div>

    <button style="width:100%; padding:14px; border-radius:10px;
                   background:var(--amber); color:#fff; border:none; margin-bottom:8px;">
      Connect Bank Account
    </button>
    <button style="width:100%; padding:14px; border-radius:10px;
                   background:transparent; border:1px solid var(--border); color:var(--text);">
      Log Expense
    </button>
  </div>
</div>
```

### Properties

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `title` | string | — | Instrument Serif, 20px |
| `subtitle` | string | — | Muted, 12px, optional |
| `content` | JSX/HTML | — | Dynamic content area |
| `cta` | string | "Confirm" | Primary button label |
| `onClose` | function | — | Called when sheet closes |
| `maxHeight` | string | "80vh" | Mobile max height |

### JavaScript API

```javascript
// Open sheet
document.getElementById('sheetId').classList.add('active');

// Close sheet
function closeSheet(sheetId) {
  document.getElementById(sheetId).classList.remove('active');
  // Reset state
}

// Content swap (for multi-step flows)
function setSheetContent(sheetId, title, subtitle, htmlContent) {
  const sheet = document.getElementById(sheetId);
  sheet.querySelector('.sheet-title').textContent = title;
  sheet.querySelector('.sheet-sub').textContent = subtitle;
  sheet.querySelector('[data-content-area]').innerHTML = htmlContent;
}
```

### Accessibility

- Overlay has `aria-modal="true"`
- X button has `aria-label="Close"`
- Focus trap: Tab within sheet content only
- Escape key closes
- Screen reader: announce sheet open/close

---

## 3. Suggestion Card Component

### Purpose

Display AI suggestion with confidence score and action buttons (Accept/Dismiss/Snooze).

### Structure

```html
<div class="sug-card">
  <div class="sug-eyebrow">
    AI Suggestion
    <span class="sug-conf">68%</span>
  </div>
  <div class="sug-text">
    You've been focused the last two days. Try 35-minute blocks instead of 25?
  </div>
  <div class="sug-actions">
    <button class="sug-btn sug-accept" onclick="acceptSuggestion(this)">Accept</button>
    <button class="sug-btn sug-dismiss" onclick="dismissSuggestion(this)">Dismiss</button>
    <button class="sug-btn sug-snooze" onclick="snoozeSuggestion(this)">Snooze</button>
  </div>
</div>
```

### Props / Data

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `text` | string | Yes | 1–2 sentences, conversational |
| `confidence` | number | Yes | 0–100, displayed as badge |
| `phase` | enum | Yes | seed, learn, act (affects tone) |
| `category` | enum | Yes | focus, sleep, exercise, etc. (colors) |
| `cta` | string[] | Yes | Button labels (default: Accept/Dismiss/Snooze) |

### Color Variants

#### Purple (default, focus/productivity)

```css
.sug-card {
  border-color: var(--purple-border);
  background: var(--purple-bg);
}
.sug-eyebrow, .sug-conf {
  color: var(--purple);
}
.sug-conf {
  background: var(--purple);
}
```

#### Teal (health/exercise)

```css
.sug-card.teal {
  border-color: var(--teal-border);
  background: var(--teal-bg);
}
.sug-card.teal .sug-eyebrow,
.sug-card.teal .sug-conf {
  color: var(--teal);
}
.sug-card.teal .sug-conf {
  background: var(--teal);
}
```

#### Amber (habits/daily)

```css
.sug-card.amber {
  border-color: var(--amber-border);
  background: var(--amber-bg);
}
.sug-card.amber .sug-eyebrow,
.sug-card.amber .sug-conf {
  color: var(--amber);
}
.sug-card.amber .sug-conf {
  background: var(--amber);
}
```

### Button Styles

**Three-button model (standard):**

| Button | Style | Usage |
|--------|-------|-------|
| **Accept** | Solid color button | Primary action (user agrees) |
| **Dismiss** | Hollow with accent color | Clear rejection |
| **Snooze** | Minimal (border only) | Defer 2–3 days |

**Two-button variant (for bold suggestions):**

```html
<div class="sug-actions">
  <button class="sug-btn sug-accept" style="flex:1;">I'm in</button>
  <button class="sug-btn sug-dismiss" style="flex:1;">Not today</button>
</div>
```

### Animations

**Entry:**
- Slide in from bottom: 0.28s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Opacity: 0 → 1

**Exit (on action):**
- Slide out top: 0.2s
- Opacity: 1 → 0
- Then remove from DOM

```javascript
function acceptSuggestion(btn) {
  btn.closest('.sug-card').style.animation = 'slideOut 0.2s ease';
  setTimeout(() => {
    btn.closest('.sug-card').remove();
  }, 200);
}
```

### Confidence Badge

- Size: 10px Inter 500
- Padding: 2px 8px
- Border-radius: 99px
- Background: category color
- Text: white
- Position: inline in eyebrow

**Confidence tiers:**
- 0–25: "Low confidence" (Observe tier, gray)
- 26–50: "Suggest tier" (amber)
- 51–75: "Recommend tier" (purple)
- 76–100: "Act tier" (teal)

### Interactions

| Action | Behavior | Result |
|--------|----------|--------|
| **Accept** | Increment acceptance counter, update confidence +20 | Suggestion removed, activity added to queue |
| **Dismiss** | Increment dismissal counter, update confidence -10 | Suggestion removed, don't show similar |
| **Snooze** | Store snooze until Day +3 | Suggestion hidden, reappear on Day +3 |

### State Management

```javascript
const suggestionStates = {
  active: 'show',
  accepted: 'logged',
  dismissed: 'hidden',
  snoozed: 'hidden_until_day_X'
};
```

### Accessibility

- Each button has `aria-label="[Action] suggestion: [text]"`
- Confidence badge: `aria-label="68% confidence"`
- Focus indicators on all buttons
- High contrast between button text and background

---

## 4. Ring Timer Component

### Purpose

Animated circular timer for focus blocks and timed activities.

### Structure

```html
<div class="ring-timer">
  <svg class="ring-svg" viewBox="0 0 120 120">
    <!-- Background circle -->
    <circle class="ring-bg" cx="60" cy="60" r="54"/>
    <!-- Progress circle (animated) -->
    <circle class="ring-circle" cx="60" cy="60" r="54"
            style="stroke-dasharray: 339.3; stroke-dashoffset: 85;"/>
    <!-- Time text -->
    <text class="timer-text" x="60" y="50">25:00</text>
    <text class="timer-label" x="60" y="75">ready</text>
  </svg>
</div>
```

### SVG Specification

| Element | Attribute | Value | Notes |
|---------|-----------|-------|-------|
| svg | viewBox | "0 0 120 120" | Responsive square |
| circle (bg) | r | 54 | Background track |
| circle (progress) | r | 54 | Animated progress |
| text (time) | font-size | 28px | Instrument Serif |
| text (time) | text-anchor | middle | Centered |
| text (label) | font-size | 11px | Muted color |

### CSS Classes

```css
.ring-timer { /* Container, aspect-ratio: 1 */ }
.ring-svg { /* Width: 100%, height: auto */ }
.ring-circle { /* Animated, stroke-dasharray transition */ }
.ring-bg { /* Static background */ }
.timer-text { /* Time display, serif font */ }
.timer-label { /* State label: ready/running/paused/complete */ }
```

### States

**Ready (initial):**
```
Time: 25:00
Label: "ready"
Color: --teal (muted)
Button: "Start timer"
```

**Running (active):**
```
Time: 24:53 (counting down)
Label: "counting down"
Color: --teal (bright)
Button: "Pause"
Stroke animation: continuous
```

**Paused:**
```
Time: 24:30 (frozen)
Label: "paused"
Color: --amber
Button: "Resume"
Stroke animation: stopped
```

**Complete (finished):**
```
Time: 00:00
Label: "complete!"
Color: --green
Button: "Log activity"
Stroke: full (100%)
```

### JavaScript Timer Logic

```javascript
class RingTimer {
  constructor(duration = 1500) { // 25 minutes in seconds
    this.duration = duration;
    this.elapsed = 0;
    this.state = 'ready'; // ready, running, paused, complete
    this.interval = null;
  }

  start() {
    this.state = 'running';
    this.interval = setInterval(() => {
      this.elapsed++;
      this.render();
      if (this.elapsed >= this.duration) {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    this.state = 'paused';
    clearInterval(this.interval);
    this.render();
  }

  resume() {
    this.start();
    this.state = 'running';
  }

  complete() {
    this.state = 'complete';
    clearInterval(this.interval);
    this.render();
    this.onComplete?.();
  }

  render() {
    const remaining = this.duration - this.elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    // Update time text
    const timeEl = document.querySelector('.timer-text');
    timeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update label
    const labelEl = document.querySelector('.timer-label');
    labelEl.textContent = this.labelForState();

    // Update stroke-dashoffset (339.3 = circumference)
    const progress = this.elapsed / this.duration;
    const offset = 339.3 * (1 - progress);
    const circleEl = document.querySelector('.ring-circle');
    circleEl.style.strokeDashoffset = offset;
  }

  labelForState() {
    const states = {
      ready: 'ready',
      running: 'counting down',
      paused: 'paused',
      complete: 'complete!'
    };
    return states[this.state];
  }
}
```

### Stroke Animation

**Circumference calculation:**
```
r = 54
C = 2πr = 2 × 3.14159 × 54 ≈ 339.3
```

**Progress mapping:**
```
stroke-dasharray: 339.3 (full circle)
stroke-dashoffset: 339.3 × (1 - progress)

At 0% complete: offset = 339.3
At 50% complete: offset = 169.65
At 100% complete: offset = 0
```

**Color transition:**
```css
.ring-circle {
  stroke: var(--teal);
  transition: stroke 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* State-specific colors via data attribute */
.ring-timer[data-state="complete"] .ring-circle {
  stroke: var(--green);
}

.ring-timer[data-state="paused"] .ring-circle {
  stroke: var(--amber);
}
```

### Button Labels by State

| State | Button | onClick |
|-------|--------|---------|
| ready | "Start timer" | `.start()` |
| running | "Pause" | `.pause()` |
| paused | "Resume" | `.resume()` |
| complete | "Log activity" | openRatingSheet() |

### Usage Example

```javascript
const timer = new RingTimer(1500); // 25 minutes

document.getElementById('startBtn').onclick = () => timer.start();
document.getElementById('pauseBtn').onclick = () => timer.pause();
document.getElementById('completeBtn').onclick = () => {
  timer.complete();
  // Show rating sheet
};
```

### Accessibility

- ARIA live region announces time remaining every 10 seconds
- Button has `aria-label="Start 25-minute focus timer"`
- Screen reader: "Timer: 24 minutes 53 seconds remaining"

---

## 5. Slider/Check-in Component

### Purpose

5-point slider for capturing mood, energy, focus ratings with real-time value display.

### Structure

```html
<div class="slider-row">
  <div class="slider-lbl">Energy</div>
  <input type="range" class="slider-inp" min="1" max="5" value="3"
         onchange="updateSlider(this)">
  <div class="slider-val" id="energy-val">3</div>
</div>
```

### CSS Properties

```css
.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-lbl {
  font-size: 12px;
  color: var(--text);
  width: 60px;
  flex-shrink: 0;
}

.slider-inp {
  flex: 1;
  accent-color: var(--teal);
  height: 4px;
  cursor: pointer;

  /* Remove browser defaults */
  appearance: none;
  -webkit-appearance: none;
}

/* Webkit slider thumb */
.slider-inp::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--teal);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Firefox slider thumb */
.slider-inp::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--teal);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-val {
  font-size: 12px;
  color: var(--teal);
  font-weight: 500;
  width: 16px;
  text-align: right;
}
```

### Tick Labels

**Default (1–5 scale):**
```
1: Poor / Low / No
2: Fair / Slightly
3: OK / Moderate / Some
4: Good / High / Yes
5: Excellent / Very / Definitely
```

**Can customize per metric:**
```javascript
const tickLabels = {
  energy: ['Drained', 'Low', 'OK', 'Good', 'Energized'],
  focus: ['Scattered', 'Unfocused', 'OK', 'Focused', 'Deep focus'],
  mood: ['Very low', 'Low', 'OK', 'Good', 'Excellent']
};
```

### Real-time Value Display

```javascript
function updateSlider(input) {
  const value = input.value;
  const parent = input.closest('.slider-row');
  const valElement = parent.querySelector('.slider-val');

  // Update display
  valElement.textContent = value;

  // Emit event for form tracking
  const event = new CustomEvent('sliderChange', {
    detail: { value, label: input.name }
  });
  input.dispatchEvent(event);
}
```

### Accessibility Features

- `min`, `max`, `value` attributes
- `aria-label="Energy level slider"` on input
- `aria-valuemin="1"`, `aria-valuemax="5"`, `aria-valuenow="3"`
- Keyboard: arrow keys increment/decrement by 1
- Tab accessible: focus visible on thumb

### Validation Rules

```javascript
const validateSliderGroup = (formData) => {
  const valid = Object.keys(formData).every(key => {
    const val = parseInt(formData[key]);
    return val >= 1 && val <= 5;
  });

  if (!valid) {
    console.warn('Invalid slider values');
    return false;
  }

  return true;
};
```

### Component Wrapper

```javascript
class CheckinCard {
  constructor(metrics = ['energy', 'focus', 'mood']) {
    this.metrics = metrics;
    this.values = {};
  }

  render() {
    return `
      <div class="checkin-card">
        <div class="checkin-title">How are you tracking?</div>
        <div class="slider-rows">
          ${this.metrics.map(m => `
            <div class="slider-row">
              <div class="slider-lbl">${m.charAt(0).toUpperCase() + m.slice(1)}</div>
              <input type="range" class="slider-inp" min="1" max="5" value="3"
                     name="${m}" onchange="updateSlider(this)">
              <div class="slider-val" id="${m}-val">3</div>
            </div>
          `).join('')}
        </div>
        <button class="checkin-btn" onclick="submitCheckin()">Save check-in</button>
      </div>
    `;
  }

  getValues() {
    const values = {};
    this.metrics.forEach(m => {
      const input = document.querySelector(`input[name="${m}"]`);
      values[m] = parseInt(input.value);
    });
    return values;
  }
}
```

---

## 6. Confidence Card Component

### Purpose

Display per-category confidence scores with 4-tier badges and visual progression.

### Structure

```html
<div class="conf-card">
  <div class="conf-title">Confidence by category</div>
  <div class="conf-rows">
    <div class="conf-row">
      <div class="conf-cat">Focus</div>
      <div class="conf-bar-track">
        <div class="conf-bar-fill cf-act" style="width: 88%;"></div>
      </div>
      <div class="conf-score">88</div>
      <div class="conf-tier ct-act">Act</div>
    </div>
    <!-- More rows -->
  </div>
</div>
```

### Per-Category Breakdown

| Category | Icon | Base Color |
|----------|------|-----------|
| Focus | ⚡ | var(--purple) |
| Sleep | 🌙 | var(--blue) |
| Exercise | 🏃 | var(--teal) |
| Tasks | 📋 | var(--amber) |
| Habits | 🌱 | var(--green) |

### 4-Tier Badge System

**Tier 1 — Observe (0–25)**
```css
.cf-observe { background: var(--hint); }
.ct-observe {
  background: var(--surf3);
  color: var(--hint);
}
```
Label: "Observe"
Message: "We're still learning"

**Tier 2 — Suggest (26–50)**
```css
.cf-suggest { background: var(--amber); }
.ct-suggest {
  background: var(--amber-bg);
  color: var(--amber);
}
```
Label: "Suggest"
Message: "We might have ideas"

**Tier 3 — Recommend (51–75)**
```css
.cf-recommend { background: var(--purple); }
.ct-recommend {
  background: var(--purple-bg);
  color: var(--purple);
}
```
Label: "Recommend"
Message: "We're fairly confident"

**Tier 4 — Act (76–100)**
```css
.cf-act { background: var(--teal); }
.ct-act {
  background: var(--teal-bg);
  color: var(--teal);
}
```
Label: "Act"
Message: "We know what to do"

### Visual Progression

**Bar width = confidence percentage:**
```
0% width: ░░░░░░░░░░
50% width: █████░░░░░
100% width: ██████████
```

**Smooth animation:**
```css
.conf-bar-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Update Animation

**When confidence changes:**
1. Bar expands/contracts (0.6s)
2. Number animates to new value
3. Tier badge updates (fade transition)

```javascript
function updateConfidenceCard(categoryId, newScore) {
  const row = document.querySelector(`[data-category="${categoryId}"]`);
  const barFill = row.querySelector('.conf-bar-fill');
  const scoreText = row.querySelector('.conf-score');
  const tierBadge = row.querySelector('.conf-tier');

  // Animate bar
  barFill.style.width = `${newScore}%`;

  // Animate score number
  animateCounter(scoreText, parseInt(scoreText.textContent), newScore, 300);

  // Update tier
  const newTier = getTierForScore(newScore);
  tierBadge.textContent = newTier;
  tierBadge.className = `conf-tier ct-${newTier.toLowerCase()}`;
}
```

### Accessibility

- Each row: `role="progressbar"`
- `aria-valuenow="88"`, `aria-valuemin="0"`, `aria-valuemax="100"`
- `aria-label="Focus confidence: 88, Act tier"`
- Tier badge has title explaining what tier means

### Usage in Context

**Appears on every day screen**, showing:**
- Top 3 categories by engagement
- Running total from Day 1 to current day
- Animation when score increases (visual reward)

**Day 7 summary:**
- All categories visible
- Highlights highest and lowest confidence
- Suggests focus areas for Week 2

---

## 7. Phase Pill Component

### Purpose

Visual indicator of which phase of the 7-day journey the user is in (Seed/Learn/Act).

### Structure

```html
<div class="phase-pill phase-seed">Seed</div>
<div class="phase-pill phase-learn">Learn</div>
<div class="phase-pill phase-act">Act</div>
```

### CSS Specifications

**Phase Seed (Days 1–2)**
```css
.phase-seed {
  background: var(--amber-bg);  /* #FDF3E0 */
  color: var(--amber);          /* #9A6B1A */
  border: 1px solid var(--amber-border);  /* #F0D090 */
}
```

**Phase Learn (Days 3–5)**
```css
.phase-learn {
  background: var(--purple-bg);  /* #F0EEFF */
  color: var(--purple);          /* #6B5ECD */
  border: 1px solid var(--purple-border);  /* #C9C1F5 */
}
```

**Phase Act (Days 6–7)**
```css
.phase-act {
  background: var(--teal-bg);    /* #E6F5F3 */
  color: var(--teal);            /* #2A7A6F */
  border: 1px solid var(--teal-border);  /* #A8D8D3 */
}
```

### Base Styling

```css
.phase-pill {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1;
}
```

### Header Integration

**Location:** Top-right of screen header

```html
<div class="hd">
  <div class="hd-left">
    <div class="hd-day">Day 1 of 7</div>
    <div class="hd-title">Let's <em>begin</em></div>
  </div>
  <div class="phase-pill phase-seed">Seed</div>
</div>
```

### Transition Animations

**Seed → Learn (Day 3):**
```javascript
function transitionPhase(fromPhase, toPhase) {
  const pill = document.querySelector('.phase-pill');

  // Fade out + scale
  pill.style.animation = 'phaseOut 0.2s ease forwards';

  setTimeout(() => {
    pill.className = `phase-pill phase-${toPhase}`;
    pill.textContent = toPhase.charAt(0).toUpperCase() + toPhase.slice(1);

    // Fade in + scale
    pill.style.animation = 'phaseIn 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards';
  }, 200);
}

@keyframes phaseOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes phaseIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Semantic Meaning

| Phase | Days | AI Behavior | Tone |
|-------|------|------------|------|
| 🌱 Seed | 1–2 | Observing only, no suggestions | "We're watching" |
| 📚 Learn | 3–5 | Gentle suggestions, testing | "What if...?" |
| ⚡ Act | 6–7 | Bold moves, high confidence | "Let's do this" |

### Responsive Design

**Desktop:** Right-aligned in header

**Mobile (375px):** Pill wraps or shrinks to fit

```css
@media (max-width: 400px) {
  .phase-pill {
    font-size: 10px;
    padding: 3px 8px;
  }
}
```

### Accessibility

- Not interactive (decorative indicator)
- Included in heading structure for context
- `aria-label="Current phase: Seed phase"` on header

---

## Implementation Checklist

- [ ] All components have working JavaScript (no framework)
- [ ] CSS transitions tested on iOS Safari, Chrome Android
- [ ] Color contrast ratios verified (WCAG AA minimum)
- [ ] Touch targets at least 44x44px
- [ ] Keyboard navigation works
- [ ] Screen reader testing with VoiceOver/TalkBack
- [ ] State management clear (no mutations outside component)
- [ ] Analytics hooks in place (component load, interaction, error)
- [ ] Performance: components render in <16ms
- [ ] Memory: no event listener leaks, timers cleaned up
