---
scope: language-agnostic
audience: reviewer (spec target)
---

# Spec Review Criteria

Checklist for reviewing feature specifications (proposal.md + spec deltas). Severity mapping: **critical** blocks approval (must fix before implementation), **major** should fix (or documented waiver), **minor** suggest (do not block), **observation** note (no action required).

## CRIT-S-01: Every requirement has a testable scenario — critical
Every requirement (SHALL/MUST statement) has at least one scenario executable as a test (Given/When/Then or equivalent). A reviewer should be able to derive an automated test without guessing intent.
**Anti-pattern:** "The system shall handle errors appropriately." — no scenarios, nothing testable.

## CRIT-S-02: Assertions on observable behavior, not internals — major
Scenario outcomes (THEN clauses) assert observable outputs (UI state, API response, message) — not internal state (database rows, private fields).
**Anti-pattern:** "THEN a row exists in table X" when a user-observable outcome exists.

## CRIT-S-03: No ambiguous language — critical
No weasel words (fast, user-friendly, robust, appropriately, "and so on"). Requirement strength expressed with RFC 2119 keywords (MUST/SHALL/SHOULD/MAY). Quantities numeric or explicitly bounded.
**Anti-pattern:** "The system should be fast and user-friendly."

## CRIT-S-04: Edge cases and error paths covered — critical
For each requirement, scenarios include at least one negative/edge case where the domain warrants it: invalid input, empty/zero values, missing permission, timeout, concurrent access.
**Anti-pattern:** Exactly one happy-path scenario per requirement.

## CRIT-S-05: Non-functional requirements present and measurable — major
Where the change touches performance, security, privacy, reliability, or compatibility, the spec includes NFRs with measurable targets (numbers, percentiles, conditions).
**Anti-pattern:** "The system must be scalable" with no target.

## CRIT-S-06: Scope has explicit boundaries (in / out) — major
The proposal states what is in scope AND what is explicitly out of scope (non-goals). A reader can tell what is deferred without asking.
**Anti-pattern:** No "Out of scope" section.

## CRIT-S-07: Rationale and impact present — major
The proposal explains WHY (problem/motivation), WHAT changes, and the IMPACT (breaking changes, compatibility, affected code/areas).
**Anti-pattern:** "Add feature X" with no motivation and no impact analysis.

## CRIT-S-08: Behavior, not implementation — major
The spec describes observable behavior, inputs/outputs, and error conditions. It does NOT prescribe internal class names, library choices, or step-by-step plans (those belong in design.md / tasks.md).
**Anti-pattern:** Spec mandates a class hierarchy or framework.

## CRIT-S-09: Terminology consistent — major
The same concept uses the same term across the spec, proposal, and the existing specs/ (domain glossary). No synonym drift.
**Anti-pattern:** "session", "token", and "auth" used interchangeably for one concept.

## CRIT-S-10: No contradictions — critical
Requirements do not contradict each other, and delta specs do not contradict the existing specs/ source of truth (values, behaviors, requirement names).
**Anti-pattern:** One requirement says "30-minute idle timeout", another says 15.

## CRIT-S-11: Requirements atomic and individually verifiable — major
Each requirement states a single behavior, verifiable on its own without cross-referencing other requirements.
**Anti-pattern:** "The system shall authenticate users, expire sessions, and notify admins" — three behaviors in one requirement.

## CRIT-S-12: No speculative scope (YAGNI) — major
No requirement exists for hypothetical future needs not in current scope; future work is listed under out-of-scope, not in scope.
**Anti-pattern:** "The system shall support multi-tenant theming" when the system is single-tenant today.

## CRIT-S-13: Delta discipline for changes to existing behavior — major
Spec deltas use ADDED / MODIFIED / REMOVED sections; MODIFIED entries show the previous value; no full-spec restatement inside a delta.
**Anti-pattern:** A delta re-describes the entire spec; MODIFIED with no "(Previously: ...)".

## Sources
OpenSpec concepts; Cucumber Gherkin reference; ISO/IEC/IEEE 29148:2018; Google eng-practices "What to Look For In Code Review".
