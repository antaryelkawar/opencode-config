# Delegation Contract

## Phase Routing (fixed — no keyword classification)

| Phase | Subagent |
|-------|----------|
| SPEC | `architect` |
| SUBSPEC | `designer` |
| APPLY | `impl-worker` |
| VERIFY | `verifier` |
| COMMIT / ARCHIVE | autopilot (direct, no dispatch) |
| research (decision protocol) | `explore` or `researcher` |

If an APPLY task is clearly outside implementation (e.g. "investigate library X"), the impl-worker routes it internally (it may dispatch `explore`/`general`). The autopilot does not re-route.

## Prompt Format — scope + autopilot-specific actions ONLY

```
Change: <slug>
Phase: <SPEC | SUBSPEC | APPLY | VERIFY>
Scope: <task id + task text verbatim, or the phase objective — nothing more>
Report: .autopilot/change-<slug>/<phase>-<n>-<kebab-slug>.md — write your full report here
State: .autopilot/change-<slug>/state.md
  - update: <e.g. "check task 3.1 in ## Tasks; append a log line in ## Log">
Do not ask the user. If blocked: record it in state.md ## Blockers and in your report, then stop.
Return a one-line status.
```

No how-to. No code. No implementation guidance — the subagent's own prompt defines the work.

## Output Locations

- Change artifacts: `openspec/changes/<slug>/` (subagent-owned)
- Reports + state: `.autopilot/change-<slug>/`
- An explicit Report/State path in the delegation prompt overrides the subagent's default output location (`.tmp/`).

## Return Contract (all subagents)

One line: `<phase> <done|blocked>: <one-line result or reason>`. Details live only in the report file. The autopilot reads state.md — never the report.

## Parallel Dispatch (APPLY only)

- The designer decomposes tasks with explicit file ownership per task.
- Disjoint file ownership = independent → up to 3 `impl-worker` dispatches in parallel, one task each.
- Any overlap → sequential.
- Never two workers on the same file.
