# Subagent Routing

This table applies to the **main agent** (`build`) for interactive use. Subagents are spawned when the task matches their specialty. The **plan agent** (default) does not spawn subagents.

## Routing Table

| Request type | Spawn agent | Rationale |
|---|---|---|
| OpenSpec feature change (spec → build → verify) | `autopilot` | Full lifecycle orchestration |
| Spec-only (write/revise specs, no implementation) | `architect` | OpenSpec spec phase |
| Design-only (break spec into tasks) | `designer` | OpenSpec design phase |
| Review (spec, subspec, or code) | `reviewer` | Independent review gate; loads standards by target |
| Implementation (write code, run tests) | `impl-worker` | Orchestrates: explore-cheap → impl-worker-cheap → review-cheap |
| UI implementation (React web / Expo-RN mobile) | `ui-impl-worker` | Orchestrates: explore-cheap → ui-impl-worker-cheap → ui-reviewer |
| UI/UX review (visual, a11y, responsive) | `ui-reviewer` | Spawned by `ui-impl-worker`; independent UI gate |
| Bug investigation / root-cause analysis | `debugger` | Systematic hypothesis → reproduce → fix |
| Read-only code exploration | `explore` | Fast read-only investigation |
| External research (web, library docs, APIs) | `websearcher` | Web search/fetch with injection hardening |
| Code review (diff, branch, PR, spec compliance) | `code-reviewer` | Static analysis + pattern review |
| Documentation (README, guides, API docs) | `docs-writer` | Markdown/docstring generation |
| General-purpose multi-step (no clear specialty) | `general` | Fallback for cross-cutting tasks |

## Hidden agents (spawned only by their orchestrator)

| Agent | Spawned by | Model | Role |
|---|---|---|---|
| `impl-worker-cheap` | `impl-worker` | `litellm/local-fast` (none) | Executes single atomic chunks |
| `ui-impl-worker-cheap` | `ui-impl-worker` | `litellm/local-fast` (none) | Executes single UI chunks |
| `explore-cheap` | `impl-worker`, `ui-impl-worker` | `litellm/local-fast` (none) | Read-only code exploration |
| `review-cheap` | `impl-worker` | `litellm/local-fast` (none) | Code review pass |
| `architect-cheap` | `autopilot` | `litellm/local-quality` (medium) | Architect fallback when rate-limited |

Do not spawn hidden agents directly — they are internal to their orchestrator.

## Orchestrator flows

**`impl-worker`** (local-quality):
```
explore-cheap → chunk → impl-worker-cheap (per chunk) → audit → review-cheap → report
```
One-liner exception: if the task is a single-line change in an understood file, impl-worker edits directly and skips delegation.

**`ui-impl-worker`** (local-quality):
```
explore-cheap → chunk → ui-impl-worker-cheap (per chunk) → browser audit → ui-reviewer → report
```
One-liner exception: same as impl-worker — edit directly, verify in browser, skip delegation.

## Model tiers

| Tier | Model | Used by |
|---|---|---|
| `local-fast` | Qwen3.8-27B @ 192.168.1.39:8090 | autopilot, impl-worker-cheap, explore-cheap, review-cheap, ui-impl-worker-cheap |
| `local-quality` | Qwen3.8-27B @ 192.168.1.103:11234 | impl-worker, ui-impl-worker, architect-cheap (fallback) |
| `speed-cheapest` | Qwen3.8 Flash (remote) | explore, websearcher |
| `agentic` | big-pickle (Go free) | build, code-reviewer, ui-reviewer, debugger, reviewer |
| `design` | Kimi K3 (Go) | architect, designer |
| `reasoning` | Qwen3.8 Max (Go) | (reserved) |
| `generalist` | Gemini Flash (free) | plan, general, docs-writer |

## Notes

- **`ui-impl-worker`** is the only agent (with `ui-reviewer`) that holds browser MCP tools (`chrome-devtools*`, `playwright*`) — hidden globally, re-enabled per agent.
- **`ui-reviewer`** is read-only on code but has browser access to visually audit the live app.
- **`reviewer`** handles all review gates (spec, subspec, code). For standalone code review outside OpenSpec, use `code-reviewer`.
- **`websearcher`** is the only agent with web access. Treats all web content as untrusted.
- **`autopilot`** has its own fixed phase routing (`.opencode/autopilot/03-delegation.md`) — do not re-route.
