---
scope: language-agnostic
audience: reviewer (design target)
---

# Design Review Criteria

Checklist for reviewing design documents (design.md, architecture decisions). Severity: **critical** blocks, **major** should fix, **minor** suggest, **observation** note.

## CRIT-D-01: Context and forces stated — critical
The design describes the current state, constraints, and forces in tension BEFORE proposing a solution. A newcomer can understand why a decision was needed.
**Anti-pattern:** The design starts with the solution; the problem is never stated.

## CRIT-D-02: Decision stated explicitly — major
The decision is a single, explicit statement (active voice: "We will ..."). Alternatives are presented as rejected options, never as the decision itself.
**Anti-pattern:** "We could use A or B depending on team preference" — no decision was made.

## CRIT-D-03: Alternatives considered with tradeoffs — critical
At least one credible alternative is documented with the reason it was rejected (cost, risk, constraint conflict).
**Anti-pattern:** Single-option design; "we considered no other options".

## CRIT-D-04: Consequences include negatives — critical
All consequences are listed — positive, negative, and neutral — including risks, migration cost, and what becomes harder in the future.
**Anti-pattern:** "This design has no downsides."

## CRIT-D-05: Goals and non-goals present and aligned with proposal — major
The design lists Goals and Non-Goals consistent with the proposal's scope. No silent scope expansion or silent scope drop.
**Anti-pattern:** Design quietly adds features the proposal never mentioned.

## CRIT-D-06: Feasible within constraints — critical
The design respects stated constraints (existing stack, performance budgets, forbidden dependencies, team skills). Quantitative claims are justified by estimates, measurements, or cited evidence.
**Anti-pattern:** "Expected speedup: 10x" with no basis.

## CRIT-D-07: Interactions and data flow explicit — major
Component interactions are shown (diagram or explicit sequence). Data movement is described: what crosses which boundary, in what format, how often.
**Anti-pattern:** A list of components with no arrows.

## CRIT-D-08: Failure modes addressed — major
The design addresses what happens when dependencies fail, time out, or return bad data. For concurrent designs, concurrency risks (race conditions, deadlocks) are explicitly considered.
**Anti-pattern:** Happy-path sequence only; no retry/timeout/degradation story.

## CRIT-D-09: NFRs addressed by the design — major
For each relevant NFR in the spec, the design gives an explicit response: the mechanism, the budget, or a measurement plan.
**Anti-pattern:** Spec says "p95 < 200ms under 1000 RPS" and the design says nothing about it.

## CRIT-D-10: No over-engineering — major
Design complexity is proportional to the problem. No speculative abstractions, no extra indirection for a single implementation, no generality nobody asked for.
**Anti-pattern:** Factory + strategy pattern for a single code path.

## CRIT-D-11: Consistent with existing architecture and prior decisions — major
The design does not contradict existing specs, ADRs, or established patterns. Deviations are explicitly justified.
**Anti-pattern:** Introducing a second state-management library with no note that it supersedes an earlier decision.

## CRIT-D-12: Status and lifecycle managed — minor
Each design/decision carries a status (proposed / accepted / deprecated / superseded). Superseded decisions reference their replacement.
**Anti-pattern:** Two designs for the same topic both marked "current".

## CRIT-D-13: One significant decision per record (ADRs) — minor
Each ADR/decision section captures one significant decision. Related but distinct decisions get separate records.
**Anti-pattern:** "ADR 42: Database choice + caching strategy + deployment topology".

## Sources
Nygard, "Documenting Architecture Decisions" (2011); MADR templates (adr.github.io); OpenSpec concepts; Google eng-practices; SEI ATAM.
