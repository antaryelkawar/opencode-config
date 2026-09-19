---
scope: loop-diagnostics
audience: reviewer, debugger, loop orchestrator (detection + prevention reference, NOT an author rulebook)
---

# Failure Mode Taxonomy

Common ways AI coding loops fail. Each entry: definition, detection signal, and the preventive standard. Load this when diagnosing a stuck or oscillating loop.

## FM-001: Oscillation
**Definition:** The loop alternates between states (fix A breaks B, fix B breaks A) with no net progress.
**Detection:** Same file/line touched in 3+ consecutive iterations with the check still failing; test results flip back and forth.
**Standard:** After two failed corrections on the same issue, stop in the polluted context and reset: fresh context + a written summary of what was tried and why it failed (LPM-006).

## FM-002: Drift
**Definition:** Implementation progressively departs from spec/design (scope creep, feature substitution) while each individual step looks plausible.
**Detection:** Periodic end-state check against requirement IDs fails; code contains behavior the spec never stated; spec requirements with no code.
**Standard:** The reviewer MUST check the implementation against spec requirement IDs (end-state evaluation, LPM-010); specs MUST carry explicit non-goals (SPX-003); reviews MUST map findings to requirement IDs (AGC-010).

## FM-003: Over-correction
**Definition:** Each review round adds more code (abstractions, defensive handling, speculative tests) than it removes; the codebase grows while the spec stays the same.
**Detection:** Diff size growing across review rounds with no new requirements; new abstractions with no consumers.
**Standard:** Reviewers restricted to correctness/requirement gaps (LPM-005); severity gating (RCR-010); over-engineering check (RCR-004); the loop MUST stop when only optional findings remain.

## FM-004: Under-specification
**Definition:** The spec omits decisions the agent then invents (values, error behavior, defaults, formats), producing plausible but unreviewed choices.
**Detection:** Agent output contains invented constants/behavior absent from the spec; the agent's assumptions list is empty or absent.
**Standard:** Specs MUST quantify every bound (SPX-006); agents MUST enumerate assumptions explicitly before implementation; spec review MUST reject unquantified qualifiers.

## FM-005: Context overflow / rot
**Definition:** Context fills with stale tool outputs and irrelevant history; the agent forgets early instructions and its precision degrades.
**Detection:** Compaction triggered mid-task; the agent repeats earlier mistakes or contradicts decisions it itself made.
**Standard:** Per-phase context budget (CTX-011); collapse old observations (TKN-008); subagents for exploration (AGC-012); fresh sessions between unrelated tasks; persistent rules in files (CTX-006).

## FM-006: Error cascade
**Definition:** One bad edit (syntax error, wrong assumption) compounds: each subsequent fix builds on a broken base, and the agent thrashes.
**Detection:** Repeated edits to the same code region with new errors appearing each time; lint/parse failures accumulating.
**Standard:** Guardrailed actions (LPM-012): validate before applying, reject with an actionable error, verify after each edit, checkpoint/rollback available; after N consecutive failed edits in the same region, stop and re-localize.

## FM-007: Telephone game
**Definition:** In multi-hop handoffs, each agent summarizes for the next and critical details (constraints, numbers, decisions) get dropped or distorted.
**Detection:** A downstream agent violates a constraint stated in the original spec; numbers/identifiers change between artifacts.
**Standard:** Filesystem artifacts are the ground truth — agents MUST read artifacts, not summaries (CTX-002); handoffs carry references + delta, with critical values quoted verbatim.

## FM-008: Infinite exploration
**Definition:** Unscoped investigation reads endlessly, fills context, and never converges to a decision.
**Detection:** Context grows with no decision output; N tool calls with no new decision recorded.
**Standard:** Investigations MUST be scoped (explicit question + boundary + turn budget); start broad, then narrow; isolate in a subagent so the main context stays clean; 'found nothing' is a valid bounded output.

## FM-009: Self-confirmation (premature success)
**Definition:** The agent concludes success without external verification — tests not run, output not checked, claims unbacked.
**Detection:** 'Done' with no check output in the transcript; the check exists but was run before the last edit.
**Standard:** Completion MUST require a machine check executed after the last change (LPM-002, LPM-003); evidence MUST be present in the transcript (RCR-013); an independent reviewer MUST re-run the check (LPM-004).

## FM-010: Conflicting parallel decisions
**Definition:** Parallel agents make incompatible decisions about shared state (naming, interfaces, formats, shared files) and integration fails.
**Detection:** Merge conflicts between parallel outputs; type/name mismatches at integration.
**Standard:** Shared decisions MUST have a single owner (serialize) or workers MUST share full relevant context (CTX-008); assign disjoint file sets; one integrator reconciles. For coding, prefer single-threaded execution over parallel fan-out by default.

## FM-011: Budget exhaustion without progress
**Definition:** The loop consumes its whole budget/iteration cap without resolving the issue — 'fail slowly.'
**Detection:** Iterations approaching the cap with the failing check unchanged; no new signal (identical error text, same code paths).
**Standard:** Early-stop on no progress (same failure signature K iterations in a row → stop); split the task; escalate to a human or redesign the task; raising the budget MUST NOT be the first response.

## FM-012: Instruction neglect (lost rules)
**Definition:** As context grows, the agent stops following earlier instructions — rules in the middle of the context are least attended to.
**Detection:** The agent violates a rule explicitly stated earlier in the session.
**Standard:** Critical rules MUST live in persistent files re-injected every session (CTX-006), not in conversation history; keep sessions short; if a single instruction keeps being skipped, strengthen that one rule — not all of them.

## FM-013: Tool thrashing
**Definition:** The agent repeatedly calls the same tool with similar parameters, or exhaustively enumerates results one by one, burning budget without new information.
**Detection:** Duplicate/near-duplicate tool calls; N consecutive 'next result' calls.
**Standard:** Interfaces MUST summarize and cap (TKN-006) and tell the agent to refine; pipelines SHOULD track redundant-call metrics and treat redundancy as a signal to right-size the interface (CTX-011).

## Sources
Claude Code Best Practices (failure patterns); SWE-agent (arXiv:2405.15793); Chroma, "Context Rot" (2025); Liu et al., "Lost in the Middle" (TACL 2023); Cognition, "Don't Build Multi-Agents"; Anthropic multi-agent research system; Deng et al. (arXiv:2606.23130).
