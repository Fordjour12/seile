# AI Layer Architecture — Project Summary

## Overview

This project is building a **production-grade AI layer** for a **Life OS** application using:

- **Convex Agents** for durable agent orchestration, threads, tools, and workflows
- **OpenRouter + AI SDK** for model access, structured generation, and tool calling
- a **multi-domain architecture** spanning:
  - Finance & Money
  - Health & Fitness
  - Mental Wellness
  - Tasks & Productivity
  - Career
  - Relationships
  - Faith & Spiritual Life
  - Space / Design & Decor

The goal is to build an AI layer that is not just a chat assistant, but a **real orchestration system** that can read product state, reason across domains, generate plans, and safely trigger actions through tools.

---

## Core Architectural Direction

### Key decision

Do **not** build one giant assistant with one mega prompt.

Instead, build a:

- **router agent**
- **specialist domain agents**
- **shared tools**
- **structured memory**
- **approval-gated action layer**
- **durable workflows**

This keeps the system safer, more maintainable, and easier to extend.

---

## System Layers

### 1. Product Domain Layer

This remains the source of truth for the application.

Domains include:

- finance
- health
- wellness
- productivity
- career
- relationships
- faith
- space

Each domain owns:

- schema
- queries
- mutations
- permissions
- analytics
- projections
- domain-specific workflows

The AI layer should never invent truth. It should only read through domain queries and write through approved tools and mutations.

### 2. AI Orchestration Layer

This is the Convex Agent layer.

Current agent direction:

- `plannerRouterAgent`
- `financeCoachAgent`
- `healthCoachAgent`
- `wellnessCoachAgent`
- `plannerAgent`

Planned later:

- `careerCoachAgent`
- `relationshipCoachAgent`
- `spiritualGuideAgent`
- `spaceDesignerAgent`
- `reflectionAgent`

### 3. Tool Layer

All meaningful AI actions should happen through tools.

Tool categories:

- **read tools** — snapshots, status, history, trends
- **write tools** — create draft tasks, routines, goals, plans
- **analysis tools** — detect burnout risk, generate plans, identify priorities

These tools are thin AI-safe wrappers over domain queries and mutations.

### 4. Model Access Layer

Use **OpenRouter** as the model gateway and **AI SDK** as the generation layer.

This gives:

- flexible model routing
- structured generation
- tool calling
- streaming support
- model swapping without changing business logic

---

## State Model

The thread established that the AI system needs three distinct kinds of state:

### Chat state
Conversation history and agent messages.

### Product state
Real app data such as:

- budgets
- transactions
- workouts
- tasks
- habits
- journal summaries
- routines
- design items

### Cognitive state
Structured AI memory, including:

- user preferences
- goals
- constraints
- risks
- planning style
- domain priorities

This should **not** be stored only in conversation history. It should live in structured memory tables.

---

## Agent Topology

### Router-first design

A router agent should:

- classify the request
- detect relevant domains
- decide whether to answer, plan, review, or hand off
- choose tools and specialist agents

This avoids overloading specialist agents with cross-domain routing logic.

### Specialist agents

Each domain specialist should have:

- a narrow system prompt
- domain-specific tools
- safe operating constraints
- a clean, limited responsibility

This improves reasoning quality and keeps the system easier to test.

---

## Approval Model

A major design choice in the thread was **approval-gated actions**.

Every tool is assigned an execution level:

- `auto`
- `confirm`
- `restricted`

### Auto
Safe reads and low-risk writes.

### Confirm
Actions with meaningful product impact.

### Restricted
Sensitive or irreversible actions.

This prevents the agent layer from making uncontrolled changes.

---

## Structured Memory

The thread introduced a structured memory system with the following memory kinds:

- `semantic`
- `episodic`
- `preference`
- `constraint`

This memory is used to store durable AI context such as:

- preferred planning style
- recurring problems
- active priorities
- known constraints
- useful user preferences

This makes the system better over time without depending entirely on raw chat history.

---

## Code Direction Already Drafted

The thread moved beyond planning into actual code scaffolding.

### Foundation files drafted

- `convex/convex.config.ts`
- `convex/ai/types.ts`
- `convex/ai/model.ts`
- `convex/ai/policies.ts`
- `convex/ai/prompts.ts`
- `convex/ai/tools/shared.ts`
- `convex/ai/tools/finance.ts`
- `convex/ai/agents/router.ts`
- `convex/ai/agents/finance.ts`
- `convex/ai/runRouter.ts`
- `convex/ai/workflows/weeklyPlanner.ts`

### Second wave drafted

- `convex/ai/tools/health.ts`
- `convex/ai/tools/wellness.ts`
- `convex/ai/agents/health.ts`
- `convex/ai/agents/wellness.ts`
- `convex/ai/agents/planner.ts`
- `convex/ai/plannerSchema.ts`
- `convex/ai/generateWeeklyPlan.ts`
- `convex/ai/memory/schema.ts`
- `convex/ai/memory/mutations.ts`
- `convex/ai/memory/queries.ts`
- `convex/ai/approval.ts`
- `convex/ai/executeWithApproval.ts`

### Example domain support drafted

- finance AI snapshot query
- productivity draft task mutation
- AI memory schema addition

---

## Current Functional Shape

At this point, the AI layer has a strong early structure:

### Agents
- Router
- Finance coach
- Health coach
- Wellness coach
- Planner

### Core capabilities
- basic domain routing
- tool-based reads and writes
- weekly plan generation
- typed structured planning outputs
- early approval gating
- early memory support

### Workflow direction
- weekly planning
- multi-domain orchestration
- future burnout intervention
- future monthly and annual review flows

---

## Design Philosophy

The biggest conceptual outcome of the thread is this:

> The AI layer should be an orchestration system, not a fancy chatbot.

That means the product should be built around:

- real application state
- domain-safe tools
- durable workflows
- explicit approvals
- structured memory
- model routing
- specialist agents

The chat interface is only one surface over that system.

---

## Recommended Repository Structure

```txt
convex/
  ai/
    agents/
      router.ts
      finance.ts
      health.ts
      wellness.ts
      planner.ts
      career.ts
      relationships.ts
      faith.ts
      space.ts
      reflection.ts
    tools/
      shared.ts
      finance.ts
      health.ts
      wellness.ts
      career.ts
      relationships.ts
      faith.ts
      space.ts
    workflows/
      weeklyPlanner.ts
      monthlyReview.ts
      burnoutIntervention.ts
      annualPlanning.ts
    memory/
      schema.ts
      mutations.ts
      queries.ts
    policies/
      modelRouting.ts
      toolPolicies.ts
      safetyPolicies.ts
    prompts/
      global.ts
      domains.ts
    types.ts
    model.ts
    approval.ts
    executeWithApproval.ts

  finance/
  health/
  wellness/
  productivity/
  career/
  relationships/
  faith/
  space/
```

---

## Why This Architecture Works

This design gives the project:

- strong separation of concerns
- clearer domain boundaries
- safe AI execution
- easier debugging
- better extensibility
- the ability to grow into proactive planning and coaching

It also makes it easier to:

- test domain tools independently
- swap models without rewriting core logic
- evolve memory and workflows over time
- support more sophisticated multi-domain planning

---

## Known Next Steps

The most important next build steps identified in the thread are:

1. Add the remaining domain agents:
   - career
   - relationships
   - faith
   - space

2. Upgrade routing:
   - replace keyword heuristics with structured intent classification
   - improve multi-domain dispatch logic

3. Add memory hydration:
   - load relevant AI memory before each agent run
   - inject memory into context blocks safely

4. Build a real tool dispatcher:
   - connect approval flow to actual tool execution
   - persist action requests and approvals

5. Expand workflows:
   - weekly review
   - monthly review
   - annual planning
   - burnout intervention
   - adaptive plan adjustment

6. Add observability:
   - tool-call tracking
   - run logs
   - cost tracking
   - approval rates
   - failure rates
   - plan acceptance metrics

---

## One-Sentence Summary

This thread established the foundation for a **multi-domain Life OS AI orchestration layer** powered by **Convex Agents, OpenRouter, and AI SDK**, with **specialist agents, structured tools, durable workflows, memory, and approval-gated actions**.

---

## Suggested Commit Message

```txt
docs(ai): add project summary for Life OS AI layer architecture
```

---

## Suggested Filename

`docs/ai-layer-project-summary.md`
