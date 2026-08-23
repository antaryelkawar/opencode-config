# Subagent Routing

This table applies to the **main agent** (`build`) for interactive use. Subagents are spawned when the task matches their specialty. The **plan agent** (default) does not spawn subagents.

## Routing Table

| Request type | Spawn agent | Rationale |
|---|---|---|
| OpenSpec feature change (spec → build → verify) | `autopilot` | Full lifecycle orchestration |
| Spec-only (write/revise specs, no implementation) | `architect` | OpenSpec spec phase |
| Design-only (break spec into tasks) | `designer` | OpenSpec design phase |
| Implementation (write code, run tests) | `impl-worker` | OpenSpec implementation + TDD |
| Verification (run tests, review against spec) | `verifier` | OpenSpec verification gate |
| Bug investigation / root-cause analysis | `debugger` | Systematic hypothesis → reproduce → fix |
| Read-only code exploration | `explore` | Fast read-only investigation |
| External research (web, library docs, APIs) | `websearcher` | Web search/fetch with injection hardening |
| Code review (diff, branch, PR, spec compliance) | `code-reviewer` | Static analysis + pattern review |
| Documentation (README, guides, API docs) | `docs-writer` | Markdown/docstring generation |
| General-purpose multi-step (no clear specialty) | `general` | Fallback for cross-cutting tasks |

## Notes

- **`impl-worker-cheap`** is hidden — only `impl-worker` spawns it. Do not spawn directly.
- **`verifier`** is OpenSpec-scoped (checks against `openspec/changes/<slug>/specs/`). For standalone code review, use `code-reviewer`.
- **`websearcher`** is the only agent with web access. It treats all web content as untrusted data.
- **`autopilot`** has its own fixed phase routing (`.opencode/autopilot/03-delegation.md`) — do not re-route.
