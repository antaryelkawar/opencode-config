---
scope: agent-consumed-specs
audience: architect, designer, spec reviewer
---

# Spec Quality for AI Consumption

How to write specs/designs/tasks that AI agents can reliably implement without drift. Complements the CRIT-S/CRIT-D/CRIT-T review criteria (which target human review); these target machine implementation.

## SPX-001: Self-contained spec
A spec MUST be self-contained for a fresh agent: name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step that proves the feature works.
**Anti-pattern:** 'Add rate limiting' — no files, no boundaries, no verification.

## SPX-002: Fresh-session executability
The spec + design + tasks set MUST be complete enough that a fresh agent session — with no prior conversation — can execute the work. The standard test: hand the artifacts to a fresh session and check it can proceed without asking questions.
**Anti-pattern:** A spec that only makes sense if you remember the two-hour chat that produced it.

## SPX-003: Non-goals are hard constraints
Specs MUST state explicit out-of-scope/non-goal items, and implementers MUST treat them as hard constraints. Agents fill unspecified scope with plausible (often wrong) work; absent non-goals is a review blocker, not a neutral omission.
**Anti-pattern:** Spec says 'add export'; the agent adds export + pagination + background jobs + caching.

## SPX-004: Bug spec structure
Bug/fix specs MUST contain four elements: reproduction steps, current behavior, expected behavior, and explicit 'must-not-change' constraints. Regression protection MUST be expressed as checkable SHALL-CONTINUE-TO statements.
**Anti-pattern:** 'Fix the login bug' — no repro, no expected behavior, no protection for what must keep working.

## SPX-005: Machine-executable acceptance
Each requirement MUST have at least one acceptance criterion that is machine-executable: a command to run, a test to pass, an observable output to diff against. (Extends CRIT-S-01 for agent execution.)
**Anti-pattern:** 'The system shall handle errors appropriately' — nothing to execute, nothing to check.

## SPX-006: Quantify every bound
Specs MUST give numeric values for every bound (timeouts, sizes, limits, counts, latencies). Vague qualifiers (fast, reasonable, appropriately, roughly) MUST NOT appear in requirements — models do not fill in reasonable defaults; they invent one.
**Anti-pattern:** 'Retry a reasonable number of times' → the agent picks 50 retries with a 10-minute timeout.

## SPX-007: Four-part delegation brief
Every task delegated to a subagent MUST contain four parts: (1) objective, (2) expected output format, (3) tool/source guidance, (4) explicit task boundaries. One-line briefs MUST be rejected by the orchestrator.
**Anti-pattern:** 'Research the semiconductor shortage' → two subagents duplicate the work, a third finds nothing.

## SPX-008: Progressive rigor
Spec rigor MUST scale to risk: most changes use a lite spec (short behavior-first requirements, scope/non-goals, a few acceptance checks); a full spec is required only for cross-team, contract/API, migration, or security/privacy changes.
**Anti-pattern:** A 20-page spec to rename a variable; a two-line spec to change a payment contract.

## SPX-009: Canonical examples
Requirements SHOULD be accompanied by 1-3 diverse, concrete input/output examples instead of an exhaustive list of edge-case rules.
**Anti-pattern:** A 40-bullet 'do not do' list; zero examples.

## SPX-010: Sync with code reality
Spec artifacts MUST be kept in sync with code reality: completed tasks MUST be marked as done, designs MUST be re-validated when implementation reveals the approach will not work, and drift between spec and code MUST be fixed at the spec level.
**Anti-pattern:** tasks.md shows everything unchecked after the work is done.

## SPX-011: Path references over prose
Specs and tasks MUST reference existing code by path (files, functions, example patterns to follow) rather than describing it in prose. Paths are precise, re-verifiable, and let the agent read the canonical example itself.
**Anti-pattern:** 'Follow the existing pattern for widgets' — which pattern, where?

## SPX-012: Declared verification commands
Specs/tasks MUST declare how to verify: the exact test command(s), build command, or observable check for each task. The agent MUST NOT have to guess the project's verification harness.
**Anti-pattern:** 'Implement X and test it' — the agent discovers three test runners, picks the wrong one.

## Sources
Claude Code Best Practices (spec self-containedness, verification criteria); OpenSpec concepts (progressive rigor, behavior contract); Kiro docs (bugfix spec structure, SHALL-CONTINUE-TO); Chroma, "Context Rot" (2025); Anthropic, "Effective context engineering".
