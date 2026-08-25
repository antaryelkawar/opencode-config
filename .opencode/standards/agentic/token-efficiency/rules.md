---
scope: agent-instruction-authoring, tool-design
audience: all agents (small enough for always-load)
---

# Token Efficiency

Rules for authoring agent instructions, tools, and delegation so every token earns its place. Multi-agent systems use ~4x (single agent) to ~15x (multi-agent) tokens vs chat — every byte matters.

## TKN-001: Every line earns its place
Lines in persistent instruction files (AGENTS.md, standards) MUST pass the deletion test: if removing the line would not cause the agent to make a mistake, cut the line. Bloated instruction files cause the model to ignore the real instructions.
**Anti-pattern:** A 300-line instruction file with tutorials and 'write clean code'; the agent skips the one rule that matters.

## TKN-002: Always vs on-demand split
Persistent context MUST be split: always-loaded context holds only cross-cutting rules; domain-specific knowledge MUST load on demand (description-triggered skills, glob-scoped rules, @file references).
**Anti-pattern:** Full API docs and every convention in every prompt.

## TKN-003: Nothing derivable
Instruction files MUST NOT contain anything the agent can derive from the codebase or already knows: standard language conventions, common tool usage, style already enforced by linters. Reference canonical examples instead of copying content.
**Anti-pattern:** Pasting an entire style guide; documenting how to use npm, git, or pytest.

## TKN-004: Right altitude
System prompts and agent instructions MUST be at the 'right altitude': specific enough to guide behavior, general enough to remain stable heuristics. MUST NOT hardcode brittle if-else decision trees, and MUST NOT be so vague that the model has no signal. Start from the minimal prompt that works; add instructions only in response to observed failure modes.
**Anti-pattern:** A 40-branch if-else prompt; or 'do your best' with zero signal.

## TKN-005: Bounded, composable rule files
Each standards/rules file MUST be bounded (under ~500 lines) and split into small, composable, single-topic files loaded per domain. A monolithic standards document MUST NOT be loaded wholesale into every agent.
**Anti-pattern:** One 2,000-line standards.md loaded into every agent regardless of task.

## TKN-006: Token-efficient tool responses
Tools and agent-facing interfaces MUST return token-efficient responses: pagination, range selection, filtering, or truncation with sensible defaults; verbose output MUST be opt-in. Search-like tools MUST cap results and tell the agent to refine the query instead of returning everything.
**Anti-pattern:** list_contacts returning every contact; unbounded grep output.

## TKN-007: No opaque identifiers
Tool/agent outputs MUST NOT return raw opaque identifiers (UUIDs, internal IDs) unless the agent needs them for a downstream call; prefer semantically meaningful names.
**Anti-pattern:** Every result as `{'id': 'a3f9c2e1-...'}` forcing the model to juggle arbitrary strings.

## TKN-008: History hygiene
Agent context MUST be actively managed: once older tool outputs have done their job, they MUST be collapsed to one-line summaries or cleared; only the most recent N observations stay at full fidelity. Persistent facts MUST move to files, not stay in history.
**Anti-pattern:** Full history of every command output kept in context.

## TKN-009: Canonical examples, not laundry lists
Instructions MUST use a small set of diverse, canonical examples instead of an exhaustive list of edge-case rules.
**Anti-pattern:** A 60-item bullet list of 'what not to do.'

## TKN-010: Evidence-driven rule add/remove
Rules MUST be added only in response to an observed, repeated mistake, and pruned when the agent does the behavior correctly without the rule.
**Anti-pattern:** Pre-emptively adding 20 rules before the agent demonstrates any need.

## TKN-011: Consolidate chained operations
Tools SHOULD consolidate frequently-chained multi-step operations into a single call that handles the sub-calls internally, rather than forcing the agent to shuttle intermediate outputs through context.
**Anti-pattern:** list_users + list_events + create_event as three round-trips.

## TKN-012: Bounded delegation outputs
Every delegation (subagent call) MUST specify the expected output format and size (e.g., 'return a summary under 200 tokens'); unbounded 'report back' MUST NOT be delegated.
**Anti-pattern:** 'Research X and tell me what you find' — a 20k-token transcript floods the orchestrator.

## TKN-013: Model tiering
Model cost MUST match step difficulty: cheap/fast models for well-defined subtasks, top models for the highest-ambiguity steps.
**Anti-pattern:** Opus-class model for formatting; or a multi-agent fan-out for a task with no parallelism.

## Sources
Claude Code Best Practices; Anthropic, "Effective context engineering for AI agents"; Anthropic, "Writing effective tools for AI agents"; SWE-agent (arXiv:2405.15793); Cursor Rules; Anthropic multi-agent research system.
