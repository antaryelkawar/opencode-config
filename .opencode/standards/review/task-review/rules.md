---
scope: language-agnostic
audience: reviewer (tasks target)
---

# Task Review Criteria

Checklist for reviewing task breakdowns (tasks.md). Severity: **critical** blocks, **major** should fix, **minor** suggest, **observation** note.

## CRIT-T-01: Tasks are specific and unambiguous — critical
Each task names a concrete action and target (file, component, endpoint). An implementer can start the task without asking "what exactly?".
**Anti-pattern:** "Improve the scheduler" or "handle edge cases".

## CRIT-T-02: Tasks independently implementable — major
Each task can be implemented and verified without depending on an unspecified or not-yet-implemented task. Dependencies are ordered or explicitly stated.
**Anti-pattern:** Task 3 calls "the API from task 12" but task 12's shape is defined nowhere.

## CRIT-T-03: Atomic — one-session granularity — major
Each task is small enough to complete in one focused session. No task is a mini-project. Anything larger is split, or explicitly marked as a time-boxed spike.
**Anti-pattern:** "Implement auth, sessions, and RBAC" as one checkbox.

## CRIT-T-04: Verifiable done — critical
Completion is objectively checkable: a passing test, an observable behavior, an endpoint contract. "Done" is defined for each task.
**Anti-pattern:** "Refactor the code" with no acceptance criteria.

## CRIT-T-05: Traceable to requirements — critical
Every requirement/scenario in the spec deltas maps to at least one task. No orphan tasks that implement no stated requirement.
**Anti-pattern:** A spec scenario with no task implementing it; or a task that quietly adds unrequested features.

## CRIT-T-06: Ordered by dependency — major
Tasks appear in a buildable top-down order: foundation before integration, tests adjacent to (or immediately after) the code they test.
**Anti-pattern:** "Add tests for X" listed before "implement X".

## CRIT-T-07: Tests are explicit tasks — major
Test work (unit / integration / e2e, coverage setup, end-to-end verification) appears as its own tasks, not implicitly folded into implementation tasks.
**Anti-pattern:** No test tasks at all; "and test it" tacked onto an implementation line.

## CRIT-T-08: Complete against the design — major
The task set covers every file/component/config/migration mentioned in the design. No design element is left unassigned.
**Anti-pattern:** Design's "File Changes" lists 5 files; tasks touch 3.

## CRIT-T-09: Achievable and time-boxed — major
No task is so large that it is unachievable in one pass. Large uncertainty is captured as an explicit time-boxed spike task.
**Anti-pattern:** A 200-line "wire everything up and make it work" task.

## CRIT-T-10: Relevant — no drive-by scope — minor
Every task contributes to this change's requirements. Unrelated cleanup/refactoring is separated into its own task or deferred, never mixed into functional work.
**Anti-pattern:** Unrelated "fix typo" tasks buried in a feature plan.

## Sources
Bill Wake, "INVEST in Good Stories, and SMART Tasks" (2003); Agile Alliance glossary; OpenSpec concepts; GitHub Spec Kit (/speckit.analyze); Google eng-practices.
