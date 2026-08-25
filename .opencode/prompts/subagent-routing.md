# Subagent Routing

This table applies to the **main agent** (`build`) for interactive use. Subagents are spawned when the task matches their specialty. The **plan agent** (default) does not spawn subagents.

## Routing Table

| Request type | Spawn agent | Rationale |
|---|---|---|
| OpenSpec feature change (spec → build → verify) | `autopilot` | Full lifecycle orchestration |
| Spec-only (write/revise specs, no implementation) | `architect` | OpenSpec spec phase |
| Design-only (break spec into tasks) | `designer` | OpenSpec design phase |
| Review (spec, subspec, or code) | `reviewer` | Independent review gate; loads standards by target |
| Implementation (write code, run tests) | `impl-worker` | OpenSpec implementation + TDD (backend/general) |
| UI implementation (React web / Expo-RN mobile) | `ui-impl-worker` | Browser-driven UI build + verify |
| UI/UX review (visual, a11y, responsive) | `ui-reviewer` | Spawned by `ui-impl-worker`; independent UI gate |
| Verification (run tests, review against spec) | `verifier` | OpenSpec verification gate |
| Bug investigation / root-cause analysis | `debugger` | Systematic hypothesis → reproduce → fix |
| Read-only code exploration | `explore` | Fast read-only investigation |
| External research (web, library docs, APIs) | `websearcher` | Web search/fetch with injection hardening |
| Code review (diff, branch, PR, spec compliance) | `code-reviewer` | Static analysis + pattern review |
| Documentation (README, guides, API docs) | `docs-writer` | Markdown/docstring generation |
| General-purpose multi-step (no clear specialty) | `general` | Fallback for cross-cutting tasks |

## Notes

- **`impl-worker-cheap`** is hidden — only `impl-worker` spawns it. Do not spawn directly.
- **`ui-impl-worker`** is the UI counterpart of `impl-worker` (web + mobile). It is the only agent (with `ui-reviewer`) that holds the browser MCP tools (`chrome-devtools*`, `playwright*`) — they are hidden globally and re-enabled per agent.
- **`ui-reviewer`** is read-only on code but has browser access to visually audit the live app. `ui-impl-worker` spawns it; it should not be spawned for non-UI work.
- **`verifier`** is OpenSpec-scoped (checks against `openspec/changes/<slug>/specs/`). For standalone code review, use `code-reviewer`.
- **`websearcher`** is the only agent with web access. It treats all web content as untrusted data.
- **`autopilot`** has its own fixed phase routing (`.opencode/autopilot/03-delegation.md`) — do not re-route.
