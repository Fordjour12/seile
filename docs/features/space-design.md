# Production-Grade Prompt — Space Domain for Single-Room Living

**Stack:** Convex + TypeScript (strict mode)
**Domain:** Space
**Context:** Single-room / studio / bedsit living
**Goal:** Build a production-ready backend domain module for helping users design, improve, and maintain a single room that contains multiple functional zones.

---

## High-Level Objective

We are building a **Space domain** for a  application.

This is **not** a homeowner or property management system.

This domain is specifically for a person living in a **single room** — for example a studio, bedsit, or one-room living setup — where the same physical space must support multiple mental modes and daily activities:

* sleeping
* working
* eating
* relaxing
* storage

The architecture must reflect the reality that this is **one room with multiple zones**, not multiple rooms.

The system should help the user:

* define and manage zones inside the room
* express a vision for the space
* plan upgrades intentionally
* log upkeep and decluttering
* track how the space feels over time
* generate data structures that support AI insights later

This module must be designed as a **production-grade domain**, not just a collection of CRUD tables.

---

## Core Product Lens

This feature must be designed around this question:

> Does this model serve someone living in a single room trying to design and improve their personal space, or does it accidentally serve a homeowner managing a whole property?

The implementation must consistently choose the first option.

That means:

* no room hierarchy
* no multi-property assumptions
* no homeowner maintenance scheduling complexity
* no landlord workflows
* no recurring appliance service models
* no property-level asset management

Instead, the domain should center:

* zones
* personal design intent
* emotional impact
* clutter and upkeep rituals
* progress toward a better-feeling space
* AI-readable signals for insight generation

---

## Technical Requirements

### Stack and standards

We are using:

* **Convex (latest stable)**
* **TypeScript**
* **strict mode enabled**
* generated Convex types
* server functions organized by domain responsibility

The implementation must be:

* fully typed
* production deployable
* modular
* secure
* readable
* scalable
* opinionated in the right places

### Hard requirements

* No `any`
* No unsafe type assertions unless absolutely necessary and justified
* No duplicated validation logic
* No business logic scattered across mutations
* No vague table design
* No “toy app” shortcuts
* No homeowner-oriented abstractions
* No over-engineering beyond the actual single-room use case

---

## Domain Model Summary

The Space domain should model a **single room with multiple zones**.

Core entities in scope:

1. `mySpace`
2. `zones`
3. `upgrades`
4. `zoneMoodLogs`
5. `wishlistItems`
6. `inspirations`
7. `upkeepLogs`
8. `declutterSessions`
9. `spaceHealthSnapshots`

These entities together should support a loop like this:

* define the vision
* define zones
* log how the space feels
* identify pain points
* plan improvements
* execute upgrades
* maintain the space
* declutter regularly
* measure whether the space is actually improving over time

---

## Required Folder Structure

Implement the Space domain under something like this structure:

```txt
package/backend/convex/
  schema.ts

  space/
    spaces.ts
    zones.ts
    upgrades.ts
    wishlist.ts
    inspirations.ts
    zoneMoodLogs.ts
    upkeepLogs.ts
    declutterSessions.ts
    spaceHealthSnapshots.ts

    lib/
      auth.ts
      validators.ts
      ownership.ts
      scoring.ts
      queries.ts
      dates.ts
      zoneRules.ts
```

You may adjust filenames slightly if needed, but keep responsibilities clearly separated.

---

## Architectural Principles

### 1. Single-room first

Do not model this as a generic interior design app for multi-room homes.

The user has **one space** and multiple **zones**.

### 2. Zones are the key abstraction

A zone is a purposeful area within the single room, such as:

* sleep
* work
* eat
* relax
* storage
* custom

All improvements and emotional tracking should be oriented around zones.

### 3. Emotional state matters

This domain is not just about furniture and purchases. It is about how the space feels and how well it supports the user’s life.

Mood, friction, transitions, clutter, and upkeep are first-class signals.

### 4. Design intent matters

Wishlist items are not just products. They are intentional changes tied to pain points, zone needs, and vision alignment.

### 5. Progress must be measurable

The system should support snapshots and trends so the product can answer:

> Is this space actually getting better?

### 6. AI should be easy to layer on later

The domain should be structured so that later AI features can generate insights from:

* trends
* zone neglect
* upgrade impact
* upkeep recency
* declutter mood deltas
* wishlist pipeline
* weakest zone patterns

---

## Schema Requirements

Define all tables in `schema.ts` using Convex `defineSchema`, `defineTable`, and validators.

Use proper indexes for all expected access patterns.

---

# 1. `mySpace`

There should be one logical space record per user.

This represents the user’s overall room and high-level design direction.

### Fields

* `userId: string`
* `name?: string`
* `type: "studio" | "bedsit" | "single_room" | "other"`
* `visionStatement?: string`
* `styleDirection?: string`
* `colorPalette?: string[]`
* `currentMoodScore?: number`
* `completionPercent?: number`
* `coverPhotoStorageId?: Id<"_storage">`
* `squareFootage?: number`
* `createdAt: number`
* `updatedAt: number`

### Indexes

* `by_userId`

### Notes

* Enforce one active space per user at the application layer if necessary.
* `visionStatement` should be treated as a foundational artifact for downstream AI/context use.

---

# 2. `zones`

Zones are the most important structure in this domain.

A zone represents a functional area inside the single room.

### Fields

* `userId: string`
* `name: string`
* `purpose: "sleep" | "work" | "eat" | "relax" | "storage" | "custom"`
* `emoji?: string`
* `visionStatement?: string`
* `currentMoodScore?: number`
* `completionPercent?: number`
* `painPoints?: string[]`
* `coverPhotoStorageId?: Id<"_storage">`
* `transitionScore?: number`
* `isActive: boolean`
* `displayOrder: number`
* `createdAt: number`
* `updatedAt: number`

### Indexes

* `by_userId`
* `by_userId_purpose`

### Notes

* `transitionScore` is single-room-specific and important. It captures how well the zone “switches off” when not in use.
* `painPoints` should be lightweight and usable in later recommendation generation.
* Validate all zone ownership against `userId`.

---

# 3. `upgrades`

Represents changes the user has already made to the space.

An upgrade may affect one zone or the whole space.

### Fields

* `userId: string`
* `zoneId?: Id<"zones">`
* `affectsAllZones: boolean`
* `title: string`
* `description?: string`
* `upgradeType: "furniture" | "lighting" | "decor" | "storage" | "textiles" | "plants" | "layout_change" | "paint" | "organisation" | "electronics" | "art" | "other"`
* `impactScore?: number`
* `impactNote?: string`
* `improvedZoneTransition?: boolean`
* `costCents?: number`
* `currency?: string`
* `isFree?: boolean`
* `beforePhotoStorageId?: Id<"_storage">`
* `afterPhotoStorageId?: Id<"_storage">`
* `linkedWishlistItemId?: Id<"wishlistItems">`
* `tags?: string[]`
* `upgradedAt: number`
* `createdAt: number`

### Indexes

* `by_userId`
* `by_userId_upgradedAt`
* `by_zoneId`
* `by_upgradeType`

### Notes

* `layout_change` is important and should be treated as a first-class upgrade type.
* Free changes should be supported properly.
* When a wishlist item is converted, relationships should be maintained.

---

# 4. `zoneMoodLogs`

Tracks how the user feels about either a specific zone or the space overall.

### Fields

* `userId: string`
* `zoneId?: Id<"zones">`
* `score: number`
* `note?: string`
* `loggedAt: number`

### Indexes

* `by_userId`
* `by_userId_loggedAt`
* `by_zoneId_loggedAt`

### Notes

* `zoneId = null/undefined` should represent overall space mood.
* Validate score range explicitly.
* This table will later feed trends, weakest-zone detection, and AI insight generation.

---

# 5. `wishlistItems`

This is not a generic shopping wishlist.

This is the **design upgrade pipeline**.

Each item should explain not just what the user wants, but why it belongs in the vision.

### Fields

* `userId: string`
* `targetZoneId?: Id<"zones">`
* `affectsAllZones: boolean`
* `name: string`
* `upgradeType: "furniture" | "lighting" | "decor" | "storage" | "textiles" | "plants" | "organisation" | "electronics" | "art" | "other"`
* `designReason?: string`
* `painPointAddressed?: string`
* `estimatedImpactScore?: number`
* `priority: "vision-critical" | "nice-to-have" | "someday"`
* `estimatedPriceCents?: number`
* `currency?: string`
* `isFree: boolean`
* `referenceUrl?: string`
* `referenceImageUrl?: string`
* `savedImageStorageId?: Id<"_storage">`
* `aiStyleScore?: number`
* `aiStyleScoreComputedAt?: number`
* `isPurchased: boolean`
* `purchasedAt?: number`
* `convertedUpgradeId?: Id<"upgrades">`
* `createdAt: number`
* `updatedAt: number`

### Indexes

* `by_userId`
* `by_userId_priority`
* `by_userId_isPurchased`
* `by_targetZoneId`
* `by_userId_upgradeType`

### Notes

* `maxBudgetCents` should not exist here; budget belongs to Finance.
* `aiStyleScore` should be computed lazily, not required on insert.
* Validate that target zone belongs to the user.

---

# 6. `inspirations`

Stores design inspiration references and mood-board material.

### Fields

* `userId: string`
* `targetZoneId?: Id<"zones">`
* `title?: string`
* `imageStorageId?: Id<"_storage">`
* `imageUrl?: string`
* `sourceUrl?: string`
* `styleTag?: string`
* `colorTags?: string[]`
* `notes?: string`
* `isMoodBoard: boolean`
* `isFavorite: boolean`
* `convertedWishlistItemId?: Id<"wishlistItems">`
* `createdAt: number`

### Indexes

* `by_userId`
* `by_targetZoneId`
* `by_userId_isMoodBoard`

### Notes

* This should be designed to support later zone-specific mood boards.
* Keep it lightweight but cleanly typed.

---

# 7. `upkeepLogs`

Use the concept of **upkeep**, not homeowner maintenance scheduling.

This is a simple log of actions the user took to care for the space.

No cron-like maintenance intervals belong in this table.

### Fields

* `userId: string`
* `zoneId?: Id<"zones">`
* `affectsAllZones: boolean`
* `title: string`
* `type: "clean" | "organise" | "repair" | "refresh" | "declutter" | "deep_clean"`
* `notes?: string`
* `moodAfter?: number`
* `energyCost: "quick" | "medium" | "big_effort"`
* `costCents?: number`
* `linkedUpgradeId?: Id<"upgrades">`
* `performedAt: number`
* `createdAt: number`

### Indexes

* `by_userId`
* `by_userId_performedAt`
* `by_zoneId`
* `by_userId_type`

### Notes

* Do not include `maintenanceIntervalDays`, `nextMaintenanceAt`, `performedBy`, or warranty tracking.
* This is about real lived upkeep, not household asset servicing.

---

# 8. `declutterSessions`

Decluttering in this domain is a repeated ritual, not a large-scale household project.

### Fields

* `userId: string`
* `zoneId?: Id<"zones">`
* `affectsAllZones: boolean`
* `title?: string`
* `method?: "konmari" | "timed_blitz" | "one_in_one_out" | "twenty_twenty" | "intuitive"`
* `itemsRemoved?: number`
* `durationMinutes?: number`
* `moodBefore?: number`
* `moodAfter?: number`
* `energyRating?: "energising" | "neutral" | "draining"`
* `spaceFeeling?: "lighter" | "clearer" | "same" | "overwhelmed"`
* `notes?: string`
* `status: "active" | "completed" | "abandoned"`
* `startedAt: number`
* `completedAt?: number`
* `createdAt: number`

### Indexes

* `by_userId`
* `by_userId_status`
* `by_zoneId`
* `by_userId_startedAt`

### Notes

* Do not over-model destinations like donated, sold, discarded, trashed.
* The emotional effect is more important than household inventory detail.

---

# 9. `spaceHealthSnapshots`

This is a weekly longitudinal snapshot showing whether the space is improving.

It must be designed specifically for single-room living.

### Fields

* `userId: string`
* `overallScore: number`
* `moodScore: number`
* `momentumScore: number`
* `upkeepScore: number`
* `zoneBalanceScore: number`
* `avgZoneMoodScore: number`
* `upgradesLast30Days: number`
* `daysSinceLastUpkeep: number`
* `daysSinceLastDeclutter: number`
* `neglectedZoneIds: string[]`
* `visionCriticalPending: number`
* `moodTrend: "improving" | "stable" | "declining"`
* `scoreVsLastWeek: number`
* `snapshotDate: string`
* `createdAt: number`

### Indexes

* `by_userId`
* `by_userId_snapshotDate`

### Notes

* This should be generated internally, not manually created by end users.
* `snapshotDate` should be stable and normalized, e.g. `YYYY-MM-DD`.
* `neglectedZoneIds` should be derived based on relative underperformance.

---

## Scoring Logic Requirements

Implement a scoring utility, for example in `space/lib/scoring.ts`, that computes a weekly space health score.

The formula should reflect:

1. **Mood** — how the space feels recently
2. **Vision momentum** — whether improvements are happening
3. **Upkeep recency** — whether the space is being cared for
4. **Zone balance** — whether one zone is being neglected

The exact structure can follow this model:

* Mood contributes 35 points
* Momentum contributes 25 points
* Upkeep contributes 20 points
* Zone balance contributes 20 points

The scoring utility must be:

* deterministic
* pure where possible
* easy to test
* not buried inside a mutation

Also include helper functions for:

* trend classification
* neglect detection
* score normalization

---

## Required Mutations and Queries

Implement the domain as a real backend module, not just tables.

Below are the required operations.

---

### `mySpace`

Required:

* `createOrInitializeMySpace`
* `getMySpace`
* `updateMySpaceVision`
* `updateMySpaceMood`
* `updateMySpaceStyle`

Behavior:

* Ensure one logical space per user
* Support initial onboarding creation
* Validate fields carefully

---

### `zones`

Required:

* `createZone`
* `listZones`
* `getZoneById`
* `updateZone`
* `reorderZones`
* `archiveOrDeactivateZone`

Behavior:

* Validate zone ownership
* Enforce sensible display order
* Keep purpose enum clean
* Prevent cross-user access

---

### `upgrades`

Required:

* `createUpgrade`
* `listUpgrades`
* `getUpgradeById`
* `updateUpgrade`
* `deleteUpgrade` or `archiveUpgrade` if needed
* `createUpgradeFromWishlistItem`

Behavior:

* Validate linked zone ownership
* Validate linked wishlist ownership
* Preserve conversion relationships

---

### `zoneMoodLogs`

Required:

* `logZoneMood`
* `listZoneMoodLogs`
* `getRecentMoodTrend`

Behavior:

* Support both overall-space logs and zone-specific logs
* Validate score range
* Optimize for recent-history queries

---

### `wishlistItems`

Required:

* `createWishlistItem`
* `updateWishlistItem`
* `listWishlistItems`
* `getWishlistItemsByZone`
* `markWishlistItemPurchased`
* `convertWishlistItemToUpgrade`
* `updateWishlistPriority`
* `computeAiStyleScore`

Behavior:

* `markWishlistItemPurchased` should update purchase fields
* `convertWishlistItemToUpgrade` should create a linked `upgrades` record and set `convertedUpgradeId`
* `computeAiStyleScore` should be lazy and idempotent

---

### `inspirations`

Required:

* `createInspiration`
* `listInspirations`
* `listZoneMoodBoard`
* `toggleFavorite`
* `convertInspirationToWishlistItem`

Behavior:

* Support mood-board use cases
* Allow optional relationship to wishlist generation

---

### `upkeepLogs`

Required:

* `createUpkeepLog`
* `listUpkeepLogs`
* `getRecentUpkeepByZone`

Behavior:

* No maintenance scheduling features
* Support quick user logging
* Make recency calculations easy for later AI use

---

### `declutterSessions`

Required:

* `startDeclutterSession`
* `completeDeclutterSession`
* `abandonDeclutterSession`
* `listDeclutterSessions`
* `getDeclutterMoodDeltaStats`

Behavior:

* Support active/completed/abandoned session states
* Validate transitions correctly
* Compute historical deltas cleanly

---

### `spaceHealthSnapshots`

Required:

* `getLatestSpaceHealthSnapshot`
* `listSpaceHealthSnapshots`
* internal function `snapshotSpaceHealth`

Behavior:

* Snapshot generation should be internal
* Use recent logs and recent upgrades to compute score
* Compare against previous week for trend delta
* Designed for weekly cron use

---

## Internal Jobs / Cron Requirements

Implement an internal weekly snapshot generator, for example:

* `snapshotSpaceHealth`

This should:

1. Load relevant users
2. Aggregate recent mood data
3. Aggregate recent upgrades
4. Calculate upkeep recency
5. Calculate declutter recency
6. Determine neglected zones
7. Count pending vision-critical wishlist items
8. Compute the composite score
9. Store a `spaceHealthSnapshots` row
10. Optionally update summarized `userContext.space` data if that context layer exists

The implementation should be clean and testable, with scoring logic separated from raw DB access.

---

## Validation and Security Requirements

You must implement shared helpers for:

* `requireUserId`
* ownership assertions
* score range validation
* enum-safe input validation where needed
* date normalization helpers
* zone relationship validation

### Security rules

* Every user-facing mutation and query must enforce ownership
* All linked IDs must be checked against the authenticated user
* Never trust client-provided foreign keys
* Unauthorized access should fail safely

---

## AI Readiness Requirements

Even if AI generation itself is not implemented now, the data model must support future insight generation.

The system should make it easy later to produce insights like:

* weakest zone by mood
* most neglected zone
* highest-ROI upgrade patterns
* declutter mood-lift patterns
* upkeep recency vs mood correlation
* vision-critical wishlist backlog
* cross-zone upgrade impact
* zone transition struggles in single-room living

Design the backend with this future usage in mind.

---

## Cross-Domain Awareness

This domain may later connect with other product domains.

Structure fields and naming so they can support future integrations with:

* **Wellness** — mood and stress correlation
* **Finance** — upgrade spend and wishlist affordability
* **Tasks** — install/setup tasks created from wishlist or upgrades
* **Sleep/Health** — sleep-zone quality and transition quality insights

Do not implement full cross-domain coupling unless necessary, but do preserve the right linking points.

---

## Edge Cases to Handle

Make sure the implementation explicitly handles:

* user references a zone they do not own
* `affectsAllZones = true` but a zoneId is also provided incorrectly
* invalid mood score ranges
* converting the same wishlist item twice
* marking already purchased items again
* completing an already completed declutter session
* abandoned session completion attempts
* archived/inactive zone being used incorrectly
* empty or meaningless required strings
* snapshot generation when some data is missing
* users with no zones yet
* users with no recent mood logs yet

---

## Code Quality Expectations

The final result should look like something a senior backend engineer would approve for production.

That means:

* well-structured files
* clean domain separation
* strong naming
* focused functions
* consistent timestamp handling
* explicit invariants
* reusable helpers
* no fragile ad hoc logic
* minimal duplication
* good defaults
* future-proof without becoming abstract nonsense

---

## Deliverables

Return:

1. `schema.ts`
2. All required Convex domain files
3. Shared helpers and validation utilities
4. Internal scoring utilities
5. Snapshot generation logic
6. Brief explanation of architectural decisions

The code must be **production-grade**, **strictly typed**, and reflect the **single-room / multi-zone reality** of the product.

---

## Final Product Expectation

The output should feel like a serious backend domain for a Life OS app that understands this truth:

> In a single room, the problem is not just how the space looks.
> It is whether the space can support different parts of life without those parts collapsing into each other.

This backend should make that measurable, actionable, and extensible.
