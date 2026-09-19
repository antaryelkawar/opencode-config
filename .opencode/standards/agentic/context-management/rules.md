---
scope: multi-agent-pipeline
audience: all agents + artifact producers
---

# Context Management & Artifact Structure

How to structure artifacts (specs, designs, tasks) so each agent in the loop gets exactly what it needs without redundant context.

## CTX-001: Role-scoped context
Each agent in the pipeline MUST receive exactly the artifacts its role requires — no more: the architect gets intent + constraints + relevant existing specs; the designer gets the approved spec; the implementer gets spec + design + its assigned tasks; the reviewer gets spec + diff + test output. Full conversation history from other agents MUST NOT be passed downstream.
**Anti-pattern:** Pasting the entire 40-message architect chat into the implementer's prompt.

## CTX-002: Files over chat
Artifacts MUST be written to persistent files and handed off by reference (path, ID), not by content pasted through conversation. The filesystem is the coordination substrate; chat is for decisions.
**Anti-pattern:** Each agent re-pastes the full spec into its prompt.

## CTX-003: Bounded subagent reports
Subagent reports back to the orchestrator MUST be bounded summaries (target: under ~2k tokens) of findings and decisions; the subagent's detailed working context MUST stay in the subagent.
**Anti-pattern:** A research subagent returns 30k tokens of raw search results to the orchestrator.

## CTX-004: Durable state in files
Cross-agent and cross-session state MUST live in structured, updatable files (task lists with checkboxes, state.json, spec deltas) that survive compaction and session restarts; conversation history MUST NOT be the sole store of state.
**Anti-pattern:** 'Don't forget to update the migration' exists only in message 47.

## CTX-005: Addressable by ID
Artifacts MUST structure content as addressable units with stable IDs (requirement IDs, scenario IDs, task numbers, decision IDs) so downstream agents can reference specific items without re-loading whole documents.
**Anti-pattern:** 'Implement the third thing we discussed' — which third thing?

## CTX-006: Persistent home for rules
Rules that must survive across sessions and compactions MUST live in persistent instruction files (AGENTS.md/standards), not in conversation history: detailed instructions early in a conversation are lost when compaction summarizes.
**Anti-pattern:** The 'never touch the legacy adapter' rule stated once in message 3 of a 200-message session.

## CTX-007: Compaction and fresh-context handoff
Long-running pipelines MUST hand off before context fills: summarize completed phases, persist essential state to files, and continue in a fresh context. Waiting for the window to overflow MUST NOT be the strategy.
**Anti-pattern:** A six-hour implementation session that runs until auto-compaction destroys half the plan.

## CTX-008: Parallel workers need full context
Parallel workers MUST NOT run on partial context: each MUST receive the full relevant decisions/trace so far (or the work MUST be serialized), because partial context produces conflicting implicit decisions.
**Anti-pattern:** Two workers each see only their own task brief; one names the interface OrderRef, the other PurchaseId.

## CTX-009: Single home per fact
Each fact MUST have exactly one home across spec/design/tasks (spec: what; design: why/how decisions; tasks: steps); duplication MUST be replaced by references. Duplicated facts drift, and the agent will follow the wrong copy.
**Anti-pattern:** The retry policy is stated in the spec, restated slightly differently in the design, and a third variant in a task.

## CTX-010: Just-in-time loading
Where feasible, context MUST be loaded just-in-time: agents SHOULD receive lightweight identifiers (file paths, stored queries, links) and the ability to fetch, rather than pre-loaded dumps of potentially irrelevant data.
**Anti-pattern:** Dumping all 200 related files into the prompt just in case.

## CTX-011: Budget and track per phase
Token usage MUST be tracked per pipeline phase; if a phase consistently overruns budget, the fix MUST be to make the artifact more concise (or restructure the work), not to raise the budget indefinitely. Redundant repeated operations MUST be treated as a signal to right-size the interface.
**Anti-pattern:** Every implementation session burns 80k tokens reading the same ten files; nobody notices.

## Sources
Anthropic, "Effective context engineering for AI agents"; Anthropic multi-agent research system; Cognition, "Don't Build Multi-Agents"; OpenSpec concepts (artifact flow); Claude Code, "How Claude Code works".
