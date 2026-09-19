---
scope: review-of-ai-generated-code
audience: code-reviewer, reviewer
---

# Review Criteria for AI-Generated Code

What to check when the code was written by an LLM — failure modes that differ from human-authored code.

## RCR-001: Verify external references
Review MUST verify every external reference the code makes (imports, API calls, library functions, CLI flags, env var names) against the project's actual dependencies and versions. Unverified references MUST be treated as blockers — LLMs hallucinate plausible APIs.
**Anti-pattern:** Code imports a helper that does not exist in the installed library version.

## RCR-002: Spec-named edge cases
Review MUST check that the code handles every edge case and error path named in the spec — not just the happy path. Missing handling for spec-named edge cases is a blocker.
**Anti-pattern:** The spec names 'expired session, concurrent update, invalid input'; the code handles none of them.

## RCR-003: Placeholder detection
Review MUST actively hunt for placeholder logic presented as complete: empty or pass-through handlers, hardcoded return values, TODO/FIXME comments, commented-out code, fake/mock data wired into production paths.
**Anti-pattern:** `async def fetch_pricing(): return 9.99  # TODO: real integration`.

## RCR-004: Over-engineering check
Review MUST flag abstractions with a single implementation, interfaces with a single consumer, config points for values that cannot change, and generality the spec never requested. In AI-authored code this check is load-bearing, because the model optimizes for perceived completeness.
**Anti-pattern:** Factory + strategy + config for one code path.

## RCR-005: Band-aid detection
Review MUST check that a fix does not solve the problem at the wrong level of abstraction: does it change behavior the spec says must not change? Does it paper over a root cause instead of addressing it? SHALL-CONTINUE-TO behavior MUST be explicitly verified.
**Anti-pattern:** Catching the exception and returning a default instead of fixing the null source.

## RCR-006: Security pattern check
Review of AI-generated code MUST explicitly check the patterns LLMs systematically miss: unfiltered/unvalidated input at boundaries, hardcoded or leaked secrets, missing authorization checks, placeholder security logic.
**Anti-pattern:** An endpoint taking a user ID from the request body with no authorization check.

## RCR-007: Test tautology check
Tests written by the same agent as the code MUST be reviewed for tautology: do the tests assert the spec's behavior, or do they merely restate the implementation? A test that passes regardless of spec conformance is worthless.
**Anti-pattern:** A test calls the function and asserts result is not None — passes even if the logic is inverted.

## RCR-008: Cross-file consistency
Review MUST check new code against the existing code it interacts with: types, names, contracts of imports, callers, schemas, and config. Repository-level consistency is where AI code most often fails, because the model edits one file at a time.
**Anti-pattern:** A new service returns an OrderStatus enum where three callers expect a string.

## RCR-009: Scope containment
Review MUST verify the diff contains no out-of-scope changes: unrelated refactors, formatting churn, renames, dependency bumps, or file deletions not justified by the task.
**Anti-pattern:** A 15-line bug-fix PR that also reformats four files and bumps two dependencies.

## RCR-010: Severity discipline
Findings MUST be severity-graded with explicit blocking semantics; review MUST distinguish 'violates a stated requirement' (blocker) from 'could be better' (optional). Uncalibrated review output MUST be treated as a process defect.
**Anti-pattern:** Thirty findings, all 'must fix,' no priority.

## RCR-011: Plausible is not correct
Review MUST assume AI-generated code that compiles and passes its own tests may still be wrong: every spec scenario MUST be checked against the implementation, not inferred from surface plausibility.
**Anti-pattern:** 'Compiles, tests green, ship it' — the off-by-one in pagination is only caught in production.

## RCR-012: No swallowed failures
Review MUST flag swallowed failures: empty catch blocks, caught-and-ignored errors, suppressed linters (@ts-ignore, eslint-disable), type escapes (as any), and pass in exception handlers.
**Anti-pattern:** `catch (e) { /* ignore */ }` around a DB write.

## RCR-013: Verify the verification
Review MUST confirm the claimed verification actually ran in the session: test output, build result, or command output MUST be present in the transcript, not just claimed.
**Anti-pattern:** 'Tests pass' with no test command output anywhere in the session.

## Sources
SWE-agent (arXiv:2405.15793); Deng et al. (arXiv:2606.23130); Anthropic, "Raising the bar on SWE-bench Verified"; Claude Code Best Practices; Khojah et al., "Same Scrutiny, More Time" (arXiv:2606.26505).
