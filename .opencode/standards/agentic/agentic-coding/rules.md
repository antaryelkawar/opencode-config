---
scope: agent-authored-and-reviewed-code
audience: impl-worker (author rules), code-reviewer / reviewer (review rules)
---

# Agentic Coding Patterns

How AI agents should write and review code when THEY are the author or reviewer (different failure modes than human author / human reviewer).

## AGC-001: Verify before reference
AI authors MUST NOT call, import, or reference APIs, functions, libraries, types, or flags without verifying they exist in the project's actual dependencies (read the file, check the installed version, or run a compile/typecheck). Unverified external references are blockers in review.
**Anti-pattern:** Importing a helper that does not exist in the installed library version.

## AGC-002: Read before edit
Before editing, the AI author MUST read the target file and the interfaces it interacts with; MUST NOT assume file contents from memory, from similar files, or from a stale snapshot.
**Anti-pattern:** Editing auth.py from memory after 30 other edits.

## AGC-003: Minimal, scoped diffs
AI authors MUST keep diffs minimal and scoped to the task; MUST NOT refactor, reformat, rename, or 'improve' unrelated code in the same change.
**Anti-pattern:** A bug-fix PR that also reformats three files and renames a function.

## AGC-004: Checks are part of the task
AI authors MUST treat the project's static checks (lint, typecheck, build) as part of the task: code MUST pass them before the task is marked complete, and failing checks MUST be addressed at the root cause, not suppressed.
**Anti-pattern:** Adding @ts-ignore or eslint-disable to silence a check.

## AGC-005: Edge cases named or flagged
AI authors MUST implement the error and edge cases named in the spec, and MUST explicitly enumerate any edge case not handled (as a known-limitations list). Silently omitting edge cases MUST NOT happen.
**Anti-pattern:** Happy path implemented; empty input, concurrent access, and permission errors unhandled and unmentioned.

## AGC-006: No placeholders in complete work
AI authors MUST NOT present placeholder, stub, or TODO code as completed work: no empty handlers, no hardcoded return values standing in for real logic, no commented-out blocks, no fake data presented as real.
**Anti-pattern:** `async def fetch_pricing(): return 9.99  # TODO: implement later`.

## AGC-007: Reviewers check what linters don't
AI reviewers MUST focus on what static tools cannot check: cross-file consistency, spec/requirement conformance, untested branches, naming drift, security-relevant logic. Style MUST be delegated to linters, not argued in review.
**Anti-pattern:** Twenty review comments about naming and formatting while the spec violation sails through.

## AGC-008: Verify claims against artifacts
AI reviewers MUST verify every completion claim against an executed artifact (test output, build result, command output) from the same session; the author's summary MUST NOT be accepted as evidence.
**Anti-pattern:** Author: 'All tests pass.' Reviewer approves without seeing the output.

## AGC-009: No self-review by the same context
AI agents MUST NOT rely on self-review in the same context as authorship for final sign-off; final review MUST be performed by a different context (fresh session/subagent), even when it is the same model.
**Anti-pattern:** 'Let me review what I just wrote' inside the same session.

## AGC-010: Shared identifiers across the loop
Authors and reviewers MUST use the same shared artifact identifiers (requirement IDs, task IDs, decision IDs) in specs and findings, so every finding maps to a requirement and every requirement maps to a verification.
**Anti-pattern:** Reviewer says 'the pagination is off' — reviewer and author disagree about which requirement's pagination.

## AGC-011: Flag speculative generality
When the author is an LLM, reviewers MUST check for over-engineering with particular suspicion: abstractions with one implementation, interfaces with one consumer, config points for values that cannot change, and generality the spec never requested MUST be flagged.
**Anti-pattern:** Factory + strategy + config layer for a single code path.

## AGC-012: Context-efficient interaction
AI agents MUST interact with the environment through narrow, high-signal operations: CLI tools for external services, targeted reads (line ranges, grep with context) instead of whole files, summarized search instead of exhaustive enumeration.
**Anti-pattern:** cat-ing a 5,000-line file to find one constant.

## AGC-013: Calibrated findings
AI review findings MUST be severity-graded with explicit blocking semantics (blocker / major / minor / observation); only blockers stop the loop. A reviewer that emits uncalibrated findings MUST be treated as broken, not thorough.
**Anti-pattern:** Forty findings, all 'important,' no priority.

## Sources
Claude Code Best Practices (adversarial review, Writer/Reviewer); SWE-agent (arXiv:2405.15793); Deng et al., "Understanding the (In)Security of Vibe-Coded Applications" (arXiv:2606.23130); Zhong et al., "From Human-Centric to Agentic Code Review" (arXiv:2607.13196).
