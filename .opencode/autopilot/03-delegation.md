# Delegation Contract

## Phase Routing (fixed — no keyword classification)

| Phase | Subagent |
|-------|----------|
| SPEC | `architect` |
| REVIEW(SPEC) | `reviewer` (target: spec) |
| SUBSPEC | `designer` |
| REVIEW(SUBSPEC) | `reviewer` (target: subspec) |
| APPLY | `impl-worker` |
| REVIEW(CODE) | `reviewer` (target: code) |
| COMMIT / ARCHIVE | autopilot (direct, no dispatch) |
| research (decision protocol) | `explore` (codebase) / `websearcher` (external) |

**APPLY → APPLY-UI selection.** A task is UI work (→ `ui-impl-worker`) when its spec/design scope is user-facing: web screens, components, styling, responsive behavior, or mobile (React Native/Expo) UI. Backend/API/data-layer work stays `impl-worker`. The designer tags each task in tasks.md with `[ui]` or `[backend]` so this is a lookup, not a guess. If a task mixes both, split it (UI slice → `ui-impl-worker`, backend slice → `impl-worker`).

If an APPLY task is clearly outside implementation (e.g. "investigate library X"), the impl-worker routes it internally (it may dispatch `explore`/`general`). The autopilot does not re-route.

## Prompt Format — scope + autopilot-specific actions ONLY

```
Change: <slug>
Phase: <SPEC | REVIEW(SPEC) | SUBSPEC | REVIEW(SUBSPEC) | APPLY | REVIEW(CODE)>
Target: <spec | subspec | code>          # REVIEW phases only
Scope: <task id + task text verbatim, or the phase objective — nothing more>
Report: .autopilot/change-<slug>/<report-file> — exact name from 02-workflow.md (e.g. review-spec-1.md, review-code-<n>.md, apply-<taskid>-<kebab-slug>.md); write your full report here
State: .autopilot/change-<slug>/state.json — owned by the autopilot_state tool; do NOT edit state.json
Do not ask the user. If blocked: return `<phase> blocked: <one-line reason>` and stop.
Return a one-line status.
```

Subagents do NOT track file lists. The COMMIT phase computes the change's file set from git against the `## Baseline` sha, so nothing hand-maintained can drift out of sync.

No how-to. No code. No implementation guidance — the subagent's own prompt defines the work.

## Output Locations

- Change artifacts: `openspec/changes/<slug>/` (subagent-owned)
- Reports + state: `.autopilot/change-<slug>/`
- An explicit Report/State path in the delegation prompt overrides the subagent's default output location (`.tmp/`).

## Return Contract (all subagents)

One line: `<phase> <done|blocked>: <one-line result or reason>`. Details live only in the report file. The autopilot reads state via the `autopilot_state` tool (op: read) — never the report.

## Parallel Dispatch (APPLY only)

- The designer decomposes tasks with explicit file ownership per task.
- Disjoint file ownership = independent → up to 3 `impl-worker` (or `ui-impl-worker` for `[ui]` tasks) dispatches in parallel, one task each.
- Any overlap → sequential.
- Never two workers on the same file.
- `ui-impl-worker` self-delegates to `ui-reviewer` for the UI/UX gate (see its prompt); the autopilot does not dispatch `ui-reviewer` directly.
