# AI Layer PRD

## Product Requirements Document

**Project:** Life OS AI Layer  
**Stack:** Convex Agents, OpenRouter, AI SDK, TypeScript  
**Status:** Draft based on architecture and code planning thread  
**Date:** March 12, 2026

---

## 1. Executive Summary

This PRD defines the architecture, file changes, orchestration model, and implementation plan for an AI layer that powers a multi-domain Life OS application.

The AI layer will support the following domains:

- Finance & Money
- Health & Fitness
- Mental Wellness
- Tasks & Productivity
- Career
- Relationships
- Faith & Spiritual Life
- Space, Design & Decor

The goal is not to build a single generic chatbot. The goal is to build a **domain-aware orchestration system** where AI can:

- understand user intent
- route requests to the right specialist
- read real product data through tools
- generate structured plans and recommendations
- propose safe actions
- persist memory and context
- coordinate workflows across multiple life domains

The architecture is centered on:

- **Convex** as the durable application and orchestration layer
- **Convex Agents** for threads, agent execution, tools, and workflows
- **OpenRouter** for model access and model routing
- **AI SDK** for tool calling, structured generation, and streaming

---

## 2. Problem Statement

The application spans several high-context life domains. A traditional app architecture would force users to manually manage each domain in isolation. A generic chat assistant would also be insufficient because it would lack durable memory, domain safety boundaries, structured outputs, and trusted access to application state.

The product needs an AI layer that can:

1. operate across multiple domains without collapsing into prompt spaghetti
2. access real user state safely through tools
3. coordinate domain specialists without duplicating logic
4. persist memory and conversations cleanly
5. support approval-gated actions
6. scale from reactive chat to proactive planning workflows

---

## 3. Product Goals

### 3.1 Primary Goals

- Build a reusable AI layer that works across all app domains
- Keep Convex as the source of truth for all app and AI state
- Use tools as the only meaningful action boundary for the model
- Support both simple chat responses and structured plans
- Enable durable, multi-step orchestration for weekly, monthly, and yearly planning
- Create a file structure that remains maintainable as more domains are added

### 3.2 Secondary Goals

- Support model routing by task type and quality/cost tier
- Add structured AI memory for preferences, constraints, and episodic summaries
- Add approval flows for sensitive writes
- Prepare the architecture for proactive agents later

### 3.3 Non-Goals

- Building a single monolithic mega-agent
- Letting models mutate product state directly
- Storing all context in chat threads only
- Shipping domain advice without guardrails or approval policies

---

## 4. Core Architectural Decision

The main architectural decision is:

> Build the AI layer as **router + specialist agents + shared tools + memory + workflows**, not as one universal assistant.

This allows the system to remain:

- modular
- testable
- observable
- safer
- cheaper to operate
- easier to extend domain by domain

---

## 5. High-Level Architecture

## 5.1 Layered Architecture

### A. Domain Layer
The domain layer contains the real application modules and business logic.

Examples:

- `finance/`
- `health/`
- `wellness/`
- `productivity/`
- `career/`
- `relationships/`
- `faith/`
- `space/`

Each domain owns:

- schema
- queries
- mutations
- indexes
- permissions
- domain services
- projections and summaries

### B. AI Orchestration Layer
This is the agent runtime and coordination layer.

Core responsibilities:

- route intent
- choose the right agent(s)
- pull domain context through tools
- generate answers/plans
- trigger workflows
- write memory
- request approvals

### C. Tool Layer
This layer exposes safe application capabilities to the model.

Tool categories:

- read tools
- draft/write tools
- analysis/planning tools

### D. Model Access Layer
This layer encapsulates OpenRouter model selection and routing policies.

Responsibilities:

- choose model by task type
- support upgrades/fallbacks
- isolate model IDs from business logic

---

## 6. System Principles

1. **Convex owns truth**  
   AI reads through queries and writes through mutations/tools.

2. **Tools are the action boundary**  
   The model should never directly perform application writes.

3. **Agents are specialists**  
   Each agent should be narrow, domain-aware, and tool-scoped.

4. **Planner logic is orchestrated, not improvised**  
   Multi-domain plans should be assembled through workflows and structured generation.

5. **Memory is structured**  
   Preferences, constraints, and episodic summaries live outside raw chat.

6. **Sensitive writes require approval**  
   Approval state is part of the architecture, not an afterthought.

---

## 7. User Scenarios

### 7.1 Single-domain
- “Help me recover from overspending this month.”
- Router -> Finance Agent -> Finance tools -> response or action proposal

### 7.2 Multi-domain planning
- “Plan my week around work, gym, prayer, and staying on budget.”
- Router -> Planner Agent -> Finance + Health + Faith + Productivity snapshots -> structured weekly plan

### 7.3 Wellness-aware intervention
- “I feel exhausted and behind on everything.”
- Router -> Wellness + Productivity -> burnout detection + plan de-intensification

### 7.4 Space guidance
- “Help me make my room feel calmer and more premium.”
- Router -> Space Agent -> room profile + wishlist + reset routines + design suggestions

### 7.5 Approval-based change
- “Set my entertainment budget to 200.”
- Router -> Finance Agent -> updateBudgetCap tool -> approval request -> execution after confirmation

---

## 8. Agent Topology

## 8.1 Router Agent
**File:** `convex/ai/agents/router.ts`

Responsibilities:

- detect domain(s)
- classify intent
- determine whether to answer, plan, review, or hand off
- choose specialist agents or shared planner path
- act as fallback when no specialist is yet implemented

Current direction:

- naive intent/domain routing helper now
- should later become structured intent classification

## 8.2 Specialist Agents

### Finance Agent
**File:** `convex/ai/agents/finance.ts`

Responsibilities:

- budgeting support
- spending recovery
- savings goal planning
- budget cap adjustment proposals

### Health Agent
**File:** `convex/ai/agents/health.ts`

Responsibilities:

- routine planning
- workout draft generation
- sustainable progression
- health habit drafts

### Wellness Agent
**File:** `convex/ai/agents/wellness.ts`

Responsibilities:

- mental load support
- reset routines
- burnout detection usage
- de-intensification suggestions

### Planner Agent
**File:** `convex/ai/agents/planner.ts`

Responsibilities:

- combine multiple domain snapshots
- create realistic weekly plans
- avoid overload
- generate structured outputs

### Future Agents
Planned but not yet scaffolded:

- `career.ts`
- `relationships.ts`
- `faith.ts`
- `space.ts`
- optional `reflection.ts`

---

## 9. Tool Architecture

## 9.1 Tool Design Rules

All tools should be:

- thin wrappers
- typed with Zod
- backed by real Convex queries or mutations
- small in scope
- safe to audit

## 9.2 Shared Tools
**File:** `convex/ai/tools/shared.ts`

Current responsibilities:

- get week snapshot
- create task draft

Potential future additions:

- create habit draft
- create plan draft
- read active goals
- read user preferences

## 9.3 Finance Tools
**File:** `convex/ai/tools/finance.ts`

Current responsibilities:

- get finance snapshot
- create savings goal
- update budget cap

## 9.4 Health Tools
**File:** `convex/ai/tools/health.ts`

Current responsibilities:

- get health snapshot
- create workout plan draft
- create health habit draft

## 9.5 Wellness Tools
**File:** `convex/ai/tools/wellness.ts`

Current responsibilities:

- get wellness snapshot
- detect burnout risk
- create reset routine draft

## 9.6 Future Domain Tool Groups
Planned:

- `careerTools.ts`
- `relationshipTools.ts`
- `faithTools.ts`
- `spaceTools.ts`

---

## 10. Model Layer

## 10.1 Model Wrapper
**File:** `convex/ai/model.ts`

Responsibilities:

- expose a simple `getModel(tier)` API
- isolate OpenRouter provider setup
- support task-to-model mapping

Current tier design:

- `fast`
- `reasoning`
- `creative`

Planned routing uses:

- fast: classification, small summaries, low-cost tasks
- reasoning: planning, orchestration, difficult synthesis
- creative: reflections, space ideation, tone-sensitive output

---

## 11. Prompt Architecture

**File:** `convex/ai/prompts.ts`

The prompt strategy is modular.

Current structure:

- global system prompt
- domain prompt helper

Benefits:

- easier versioning
- easier testing
- clear domain constraints
- avoids prompt duplication

Planned extension:

- planning prompt blocks
- safety prompt blocks
- memory hydration prompt blocks
- response formatting prompt blocks

---

## 12. Type System and Structured Outputs

## 12.1 Shared Types
**File:** `convex/ai/types.ts`

Current shared types include:

- domain enum-like unions
- goal horizon
- approval mode
- plan item shape
- pending action shape
- high-level AI response union

## 12.2 Planner Schema
**File:** `convex/ai/plannerSchema.ts`

This file defines a typed weekly plan contract using Zod.

Current plan structure includes:

- title
- summary
- focus areas
- energy notes
- day-by-day task lists
- suggested habits

This is a key change because it moves the AI layer from freeform text to **structured planning output**.

---

## 13. Memory Architecture

## 13.1 Why Memory Exists

The application needs AI memory that is more durable and reusable than chat history.

Examples:

- user prefers flexible planning
- user gets tired in the afternoon
- user is focused on reducing discretionary spending
- user wants a calmer bedroom aesthetic

## 13.2 Memory Model

**Files:**
- `convex/ai/memory/schema.ts`
- `convex/ai/memory/mutations.ts`
- `convex/ai/memory/queries.ts`

Memory kinds:

- semantic
- episodic
- preference
- constraint

Domain scoping:

- finance
- health
- wellness
- productivity
- career
- relationships
- faith
- space
- global

## 13.3 Current Capabilities

- upsert memory record
- fetch relevant memory by user/domain

## 13.4 Future Capabilities

- confidence decay
- memory summarization
- automated reflection agent writes
- memory hydration before each agent run
- memory conflict resolution

---

## 14. Approval and Safety Architecture

## 14.1 Approval Policy

**Files:**
- `convex/ai/policies.ts`
- `convex/ai/approval.ts`
- `convex/ai/executeWithApproval.ts`

Approval modes:

- `auto`
- `confirm`
- `restricted`

## 14.2 Why This Matters

Not every tool should execute immediately.

Examples:

- reading a snapshot -> auto
- creating a goal -> confirm
- irreversible bulk updates -> restricted

## 14.3 Current Capabilities

- determine tool approval mode
- build pending action objects
- detect whether approval is required
- return approval-needed responses before execution

## 14.4 Future Capabilities

- persistent approvals table
- approval expiry
- approval audit log
- batch approvals
- domain-specific sensitivity rules

---

## 15. Workflows and Orchestration

## 15.1 Current Workflow Skeleton
**File:** `convex/ai/workflows/weeklyPlanner.ts`

The current weekly planner workflow demonstrates the intended orchestration model:

1. create planner/router thread
2. run specialist review (currently finance example)
3. merge outputs into a final plan
4. return durable workflow result

## 15.2 Structured Weekly Plan Generation
**File:** `convex/ai/generateWeeklyPlan.ts`

This action generates a typed weekly plan object using structured generation.

## 15.3 Orchestration Pattern

The general orchestration flow should be:

1. user sends request
2. `runAI` action receives request
3. router classifies domains and intent
4. route chooses specialist or planner path
5. agent uses tools to read domain state
6. agent returns message, plan, or approval request
7. optional workflow coordinates multi-step tasks
8. optional memory write persists durable context

---

## 16. File Changes Introduced in This Thread

This section captures the file-level changes and additions implied by the thread.

## 16.1 New Convex App Config

### `convex/convex.config.ts`
**Change:** register Convex Agent component

Purpose:

- enable agent component in the Convex app

---

## 16.2 New AI Root Module

### `convex/ai/types.ts`
**Change:** add shared AI types

### `convex/ai/model.ts`
**Change:** add OpenRouter provider setup and model-tier routing

### `convex/ai/policies.ts`
**Change:** add tool approval mapping and domain intent helpers

### `convex/ai/prompts.ts`
**Change:** add global and per-domain prompt composition

### `convex/ai/plannerSchema.ts`
**Change:** add Zod schema for weekly plans

### `convex/ai/generateWeeklyPlan.ts`
**Change:** add structured plan generation action

### `convex/ai/approval.ts`
**Change:** add approval helper logic

### `convex/ai/executeWithApproval.ts`
**Change:** add approval-aware execution entrypoint placeholder

### `convex/ai/runRouter.ts`
**Change:** add main `runAI` action entrypoint

---

## 16.3 Agent Files

### `convex/ai/agents/router.ts`
**Change:** add router agent and initial route helper

### `convex/ai/agents/finance.ts`
**Change:** add finance specialist agent

### `convex/ai/agents/health.ts`
**Change:** add health specialist agent

### `convex/ai/agents/wellness.ts`
**Change:** add wellness specialist agent

### `convex/ai/agents/planner.ts`
**Change:** add cross-domain planner agent

---

## 16.4 Tool Files

### `convex/ai/tools/shared.ts`
**Change:** add shared planning/task tools

### `convex/ai/tools/finance.ts`
**Change:** add finance tools

### `convex/ai/tools/health.ts`
**Change:** add health tools

### `convex/ai/tools/wellness.ts`
**Change:** add wellness tools

---

## 16.5 Workflow Files

### `convex/ai/workflows/weeklyPlanner.ts`
**Change:** add durable weekly planning workflow skeleton

---

## 16.6 Memory Files

### `convex/ai/memory/schema.ts`
**Change:** define memory record shape

### `convex/ai/memory/mutations.ts`
**Change:** add memory upsert mutation

### `convex/ai/memory/queries.ts`
**Change:** add memory fetch query

---

## 16.7 Schema Changes

### `convex/schema.ts`
**Change:** add `aiMemory` table and indexes

Current indexes planned:

- `by_user`
- `by_user_key`

Future likely schema additions:

- `aiThreads`
- `aiRuns`
- `aiToolCalls`
- `aiApprovals`
- `aiPlans`
- `aiRecommendations`

---

## 16.8 Domain-side Supporting Files

Thread examples assumed or proposed these supporting files:

### Finance
- `convex/finance/ai.ts`
- `convex/finance/goals.ts`
- `convex/finance/budgets.ts`

### Productivity
- `convex/productivity/tasks.ts`
- `convex/productivity/planner.ts`

### Health
- `convex/health/ai.ts`
- `convex/health/plans.ts`
- `convex/health/habits.ts`

### Wellness
- `convex/wellness/ai.ts`
- `convex/wellness/routines.ts`

These are application-facing domain modules the tools depend on.

---

## 17. Architecture Changes Compared to a Traditional App

## 17.1 Before
A traditional app structure would likely have:

- isolated domain CRUD
- no orchestration layer
- no shared planning logic
- no AI memory
- no tool execution policy
- no cross-domain routing

## 17.2 After
The target structure becomes:

- durable orchestration through Convex Agents/workflows
- model abstraction through OpenRouter
- AI SDK for structured generation and tool calling
- specialist agents per domain
- shared planner for multi-domain synthesis
- approval-aware tool execution
- AI memory as first-class state

This is a major architectural upgrade from “add AI to the app” to “make AI a product subsystem.”

---

## 18. Recommended Final Folder Structure

```txt
convex/
  ai/
    agents/
      router.ts
      planner.ts
      finance.ts
      health.ts
      wellness.ts
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
      annualPlanning.ts
      burnoutIntervention.ts
    memory/
      schema.ts
      mutations.ts
      queries.ts
      hydration.ts
      summarizer.ts
    policies/
      modelRouting.ts
      toolPolicies.ts
      handoffRules.ts
      safetyPolicies.ts
    prompts/
      global.ts
      domains.ts
      planner.ts
      responseFormatting.ts
    approval.ts
    executeWithApproval.ts
    generateWeeklyPlan.ts
    plannerSchema.ts
    runRouter.ts
    types.ts
    model.ts

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

## 19. Detailed Orchestration Flows

## 19.1 Reactive Chat Flow

1. User sends a message from app UI
2. Frontend calls `runAI`
3. `runAI` invokes routing logic
4. Router determines domains and intent
5. Router selects specialist or planner
6. Agent accesses tools as needed
7. Agent returns:
   - plain message
   - structured plan
   - approval request
8. Frontend renders corresponding response UI

## 19.2 Weekly Planning Flow

1. User asks for weekly plan
2. Router identifies multi-domain planning intent
3. Planner agent gathers week snapshot
4. Planner gathers finance/health/wellness context as needed
5. Burnout or overload signals are checked
6. Structured weekly plan is generated
7. Optional draft tasks/habits are created
8. Plan is shown to user for acceptance or editing

## 19.3 Approval Flow

1. Agent decides to use a sensitive write tool
2. Approval helper determines tool mode
3. If mode is confirm/restricted, system returns pending action
4. Frontend shows approval UI
5. User approves or rejects
6. Approved action is executed through dispatcher
7. Result is persisted and surfaced

## 19.4 Memory Flow

1. Significant user preference or constraint is identified
2. AI or workflow writes memory record using upsert mutation
3. Future agent run fetches relevant memory by user/domain
4. Prompt is hydrated with memory summary
5. Output becomes more personalized and consistent

## 19.5 Future Proactive Flow

1. Scheduled workflow runs weekly or monthly
2. Domain snapshots are gathered
3. Planner or specialist agents synthesize reviews
4. Recommendations or draft plans are produced
5. User receives review or suggestions in product UI

---

## 20. Frontend Implications

The frontend should be prepared to render multiple AI response types, not just chat bubbles.

Suggested response modes:

- `message`
- `plan`
- `approval_request`
- `suggestions`
- `review`

Frontend UI implications:

- plan cards
- approval sheets/modals
- suggested action chips
- domain badges
- live stream support later

---

## 21. Data Contracts to Standardize

The following contracts should be standardized early:

1. domain snapshot contracts
2. AI response contracts
3. pending action contracts
4. weekly plan schema
5. memory record schema
6. tool result shape conventions

Suggested convention for tool return shape:

```ts
{
  ok: boolean;
  requiresConfirmation?: boolean;
  preview?: unknown;
  data?: unknown;
  error?: string;
}
```

---

## 22. Observability Requirements

The architecture should eventually track:

- agent used
- model used
- latency
- tool calls made
- success/failure rate
- approval requested vs granted
- structured plan generation success rate
- domain routing distribution
- memory write frequency
- cost by model/domain

Recommended future tables:

- `aiRuns`
- `aiToolCalls`
- `aiApprovals`
- `aiPlanRuns`

---

## 23. Security and Safety Considerations

### Finance
- do not imply licensed financial advice
- use app data, not assumptions
- guard high-impact writes

### Health
- do not diagnose
- avoid dangerous recommendations
- keep suggestions general and sustainable

### Wellness
- avoid diagnosis
- prioritize supportive, non-coercive framing
- provide practical routines and pacing support

### Relationships
- avoid manipulative guidance
- avoid surveillance-style tools or recommendations

### Faith
- respect user framing
- avoid presenting one interpretation as objective truth by default

### Space
- do not invent prices or measurements

---

## 24. Rollout Plan

## Phase 1: Foundation
Ship:

- model wrapper
- shared prompts
- router agent
- finance agent
- health agent
- wellness agent
- planner agent
- shared/finance/health/wellness tools
- weekly plan schema
- memory basics
- approval basics

## Phase 2: Reliability and UX
Ship:

- structured router classification
- memory hydration
- frontend approval UI
- better dispatcher
- thread persistence refinement
- streaming support

## Phase 3: Domain Expansion
Ship:

- career agent/tools
n- relationships agent/tools
- faith agent/tools
- space agent/tools

## Phase 4: Proactive Intelligence
Ship:

- weekly review workflows
- monthly finance reviews
- burnout intervention workflows
- adaptive plan intensity
- reflection summaries

---

## 25. Open Technical Gaps

These still need implementation or refinement:

- persistent run tracking
- robust tool dispatcher
- agent/thread persistence strategy details
- structured router classifier using model instead of regex only
- memory hydration before agent execution
- reflection agent for summarization
- future proactive scheduling architecture
- approval persistence and audit logs
- cost control and model routing benchmarks

---

## 26. Success Criteria

The AI layer will be considered successful when:

1. user requests are correctly routed to the right domain or planner path
2. agents use domain tools reliably instead of hallucinating product state
3. weekly plans are generated as structured objects, not loose text blobs
4. memory improves continuity without polluting chat history
5. sensitive actions are consistently approval-gated
6. adding a new domain requires predictable file additions rather than major rewrites

---

## 27. Final Recommendation

The application should treat AI as a **first-class backend subsystem**.

That means the final implementation should preserve this separation:

- **domains own truth**
- **tools expose controlled capabilities**
- **agents reason within scoped boundaries**
- **planner coordinates across domains**
- **workflows handle durable multi-step orchestration**
- **memory stores reusable context**
- **approval protects sensitive writes**

This thread already established the foundation for that direction. The next implementation step is not more abstract ideation; it is to convert the drafted files into a coherent repo structure and then add the missing domain agents, dispatcher, and persistence/observability layers.
