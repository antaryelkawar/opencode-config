---
scope: agent-loop-orchestration
audience: loop orchestrator, impl-worker, verifier, reviewer
---

# Loop Engineering

How to structure iterative AI coding loops (generate → review → fix) so they converge rather than oscillate.

## LPM-001: Stopping conditions
Every iterative loop MUST have an explicit stopping condition: a pass/fail check, a max iteration count, or a token/time budget. An agent MUST NOT be allowed to run until context exhaustion.
**Anti-pattern:** 'Keep working until it's done' with no definition of done.

## LPM-002: External signal closes the loop
Generate → review → fix loops MUST close on an external, machine-checkable signal (test suite, build exit code, linter, diff against fixture). The model's own opinion of its output MUST NOT be the termination condition.
**Anti-pattern:** 'I think that should work now' — the model re-reads its own code and declares success.

## LPM-003: Evidence before claims
An agent MUST show evidence of success (test output, the command it ran and its result) before asserting done; 'it works' without an executed check in the same session is not a completion.
**Anti-pattern:** 'Implemented the rate limiter. All good!' with no test run in the transcript.

## LPM-004: Independent reviewer
Review MUST run in a fresh context that has not seen the generator's reasoning: the reviewer sees only the artifact (the diff) and the criteria, and evaluates the result on its own terms. The same session MUST NOT be its own final reviewer.
**Anti-pattern:** The implementing agent runs 'let me double-check my work' in the same context and approves its own output.

## LPM-005: Gaps, not opinions
Reviewer prompts MUST demand gaps against the stated requirements and plan — not style preferences. Findings that do not affect correctness or the stated requirements MUST be classified optional and MUST NOT block the loop.
**Anti-pattern:** 'Review for issues' → 14 minor nits → the implementer adds six abstractions to satisfy them.

## LPM-006: Two-strike context reset
After two failed fix attempts on the same issue, the loop MUST stop iterating in the same context. The next attempt MUST run in a fresh context with a prompt incorporating what was tried and why it failed.
**Anti-pattern:** Seven rounds of 'try again' in the same session, each adding more failed approaches to the context.

## LPM-007: Gates between stages
Multi-stage pipelines (spec → design → tasks → implementation) MUST insert programmatic gates between stages: a checkable criterion (schema validation, cross-artifact consistency check, coverage check) that must pass before the next stage runs.
**Anti-pattern:** The designer starts from an inconsistent spec.

## LPM-008: Prefer structured phases for coding
For coding tasks, prefer structured, verifiable phases (reproduce/localize → implement → verify) over fully autonomous open-ended loops; grant autonomy only where subtasks genuinely cannot be predicted.
**Anti-pattern:** A four-agent conversation to fix a null pointer.

## LPM-009: Feedback in the fix prompt
Fix prompts MUST include the external feedback signal verbatim (error text, failing test output, diff vs expected). Reflection without the signal MUST NOT count as an iteration.
**Anti-pattern:** 'The tests failed, fix them' with no output pasted.

## LPM-010: End-state evaluation
Pipeline evaluation MUST judge end-state checkpoints (does the artifact satisfy the requirement?) rather than prescribed step sequences; an agent that reaches the same goal by a different path MUST be judged on outcome.
**Anti-pattern:** Failing the agent for not following step 3 of the plan when the outcome is correct.

## LPM-011: Serialize shared-state decisions
Parallel workers MUST NOT make independent decisions about shared state (interfaces, naming, schemas, shared files). Shared decisions MUST have a single owner (serialized), or workers MUST share the full relevant context before acting.
**Anti-pattern:** Worker A names the interface OrderRef, worker B names it PurchaseId.

## LPM-012: Guardrailed actions
Error-prone actions (file edits, schema changes, deletions) MUST be wrapped in guardrails that validate before applying (linter/parse check, exact-match validation) and reject invalid operations with an actionable error and a retry opportunity.
**Anti-pattern:** An edit introduces a syntax error, and the agent builds three more fixes on top.

## LPM-013: Change strategy after failure
After a failed attempt, the next iteration MUST change strategy (different hypothesis or approach), not retry the same action. Repeating the same failed edit MUST be detected and stopped by the loop.
**Anti-pattern:** The same edit attempted five times with identical parameters.

## Sources
Claude Code Best Practices (Writer/Reviewer, two-strike rule); Anthropic, "Building effective agents"; SWE-agent (arXiv:2405.15793); Agentless (arXiv:2407.01489); Reflexion (arXiv:2303.11366); Cognition, "Don't Build Multi-Agents".
