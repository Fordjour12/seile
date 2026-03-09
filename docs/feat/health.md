# Health & Fitness + Energy Engine

## Product Requirements Document (PRD)

Version: 1.0
Status: Production Design
Owner: Product / AI Systems

---

# 1. Overview

The **Health & Fitness system** helps users manage physical wellbeing while generating **energy signals** used by the AI Planner.

These signals feed into the **Energy Engine**, which allows the planner to schedule work, workouts, and recovery based on the user's **real capacity and energy patterns**.

The system therefore supports three major goals:

1. Improve health and fitness.
2. Provide energy signals to the planner.
3. Enable energy-aware planning.

---

# 2. Product Vision

Create a system that understands **how the user feels and performs**, not just what tasks exist.

The application should balance:

- productivity
- recovery
- health
- habits
- energy

Ultimately becoming a **Life Operating System** that protects the user's wellbeing while enabling progress.

---

# 3. Core Principles

1. **Health supports productivity**
2. **Energy determines capacity**
3. **Consistency beats intensity**
4. **Recovery is planned**
5. **Small signals improve planning**

---

# 4. System Architecture

The Health & Fitness feature is part of a larger system.

```
Life OS
│
├ Planner Engine
│
├ Planner Agent
│
├ Health & Fitness
│   ├ workouts
│   ├ health habits
│   ├ sleep tracking
│   └ health goals
│
├ Energy Signals
│   ├ sleep score
│   ├ fatigue score
│   ├ recovery score
│   └ energy logs
│
└ Energy Engine
    ├ daily energy model
    ├ weekly energy model
    └ capacity estimation
```

---

# 5. User Problems

Users struggle to:

- maintain fitness routines
- balance work and recovery
- understand their energy patterns
- avoid burnout
- plan realistically

Most planners ignore health and energy.

This system connects them.

---

# 6. Feature Scope

The feature includes three layers:

1. **Health & Fitness Domain**
2. **Energy Signals**
3. **Energy Engine**

---

# 7. Health & Fitness Domain

## 7.1 Workouts

Users can track workouts.

Examples:

- strength training
- running
- walking
- cycling
- yoga
- stretching
- sports

Workouts can be created manually or scheduled by the planner.

### Data model

```
workouts
```

Fields:

- userId
- workoutType
- durationMinutes
- intensity
- caloriesBurned
- date
- linkedPlanItemId
- notes
- createdAt

---

## 7.2 Health Habits

Health habits encourage consistent wellness routines.

Examples:

- drink water
- walk daily
- stretch
- sleep early
- meditation

These integrate with the existing **habit system**.

### Data model

```
healthHabits
```

Fields:

- userId
- name
- cadence
- targetValue
- unit
- difficulty
- createdAt

---

## 7.3 Health Goals

Users can define measurable health goals.

Examples:

- exercise 3x per week
- run 5km
- lose 5kg
- improve sleep

### Data model

```
healthGoals
```

Fields:

- userId
- title
- goalType
- targetValue
- unit
- deadline
- progress
- status

---

## 7.4 Health Metrics

Optional health data tracking.

Examples:

- sleep hours
- steps
- weight
- heart rate
- energy rating

### Data model

```
healthMetrics
```

Fields:

- userId
- date
- sleepHours
- steps
- weight
- restingHeartRate
- energyLevel
- notes

---

# 8. Energy Signals

Energy signals convert health data into **usable planning signals**.

Signals include:

- sleep score
- recovery score
- fatigue score
- energy rating
- workout intensity load

These signals feed the Energy Engine.

---

# 9. Energy Logging

Users can log energy manually.

Example check-in:

“How is your energy right now?”

Options:

- low
- medium
- high

This is a **low friction signal with high value**.

### Data model

```
energyLogs
```

Fields:

- userId
- timestamp
- energyLevel
- stressLevel
- fatigueLevel
- notes

---

# 10. Energy Engine

The Energy Engine transforms raw signals into **planning intelligence**.

---

## 10.1 Purpose

Enable the planner to schedule tasks and activities according to the user's **actual energy patterns**.

---

## 10.2 Daily Energy Model

The system identifies daily energy zones.

Example:

Morning
High energy

Afternoon
Medium energy

Late afternoon
Low energy

Evening
Medium energy

The planner uses this model when scheduling.

---

## 10.3 Weekly Energy Model

The engine also evaluates weekly patterns.

Example:

Monday
High energy

Wednesday
Moderate energy

Friday
Low energy

This prevents planners from stacking heavy work on low-energy days.

---

## 10.4 Recovery Model

The system tracks fatigue and recovery cycles.

Example rule:

If workload and workouts exceed recovery capacity → planner inserts recovery block.

---

# 11. Planner Integration

When generating plans, the planner checks:

- energy signals
- health goals
- workout history
- sleep patterns

The planner then:

- schedules workouts
- places deep work in high energy zones
- schedules recovery during low energy periods

---

# 12. Planner Agent Integration

The Planner Agent uses health and energy signals.

Examples:

### Burnout detection

Signals include:

- low energy ratings
- missed workouts
- declining completion
- poor sleep

If burnout risk increases:

Planner switches to **Recovery Mode**.

---

### Habit optimization

Example:

Morning workout skipped repeatedly.

Agent suggestion:

- move workout to evening
- reduce frequency
- replace with walking

---

# 13. AI Tool Calls

The planner can create health activities.

### createWorkout

Parameters:

- type
- durationMinutes
- intensity
- date
- linkedPlanId

---

### createHealthHabit

Parameters:

- name
- cadence
- targetValue
- unit

---

### logEnergy

Parameters:

- energyLevel
- stressLevel
- fatigueLevel

---

# 14. AI Prompt Rules

Planner prompts must include these instructions.

### Health-Aware Planning

The planner must consider health goals when generating plans.

Rules:

- include recovery days
- avoid consecutive intense workouts
- balance mental and physical load

---

### Energy-Aware Scheduling

High focus tasks should be placed in high-energy zones.

Low energy periods should contain lighter tasks.

---

### Burnout Protection

If workload and fatigue increase:

- reduce tasks
- replace intense workouts with light activity
- increase recovery blocks

---

# 15. UX Design

Health & Fitness appears as a top-level domain.

Sections include:

### Health Dashboard

Shows:

- workout progress
- step counts
- habit streaks
- energy trend

---

### Workouts

Users can:

- log workouts
- view planner workouts
- track workout history

---

### Habits

Shows health habit progress.

---

### Goals

Displays health goal progress.

---

# 16. Success Metrics

Success indicators include:

### Health metrics

- workouts completed
- health habit consistency
- goal progress

### Planner metrics

- planner usage linked to health
- energy-aware planning adoption

### Retention metrics

- users active in health module
- weekly engagement

---

# 17. Rollout Plan

### Phase 1

Health & fitness basics:

- workouts
- health habits
- health goals
- health metrics

---

### Phase 2

Energy signals:

- energy logs
- sleep tracking
- fatigue scoring

---

### Phase 3

Energy Engine:

- daily energy modeling
- weekly energy modeling
- planner integration

---

### Phase 4

Agent intelligence:

- burnout detection
- recovery planning
- habit optimization

---

# 18. Long-Term Vision

The combined system becomes a **Life Operating System** capable of balancing:

- productivity
- health
- habits
- recovery
- goals
- energy

The AI planner evolves into a **strategic life assistant** that protects wellbeing while helping users make steady progress.

---
