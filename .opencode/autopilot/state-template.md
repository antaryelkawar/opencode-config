# <slug>

status: <SPEC | SUBSPEC | APPLY | VERIFY | COMMIT | ARCHIVE | DONE | BLOCKED>

## Plan
- [ ] spec     — architect
- [ ] subspec  — designer
- [ ] apply    — impl-worker (0/N tasks)
- [ ] verify   — verifier (cycle 0)
- [ ] commit   — autopilot
- [ ] archive  — autopilot

## Tasks
<!-- Mirror of openspec/changes/<slug>/tasks.md. Subagents check their own line. -->

## Verify
| cycle | verdict | critical | report |
|-------|---------|----------|--------|

## Baseline
<!-- The git HEAD sha at change start, recorded in phase 0. COMMIT stages the diff against this sha — the file set is computed by git, never hand-maintained, so it cannot drift out of sync. -->
base: <sha-or-"root">

## Log
<!-- One line per event: `YYYY-MM-DDTHH:MM phase=<p> actor=<a> event=<e> result=<r>` -->

## Blockers
(none)

## Outputs
- openspec: `openspec/changes/<slug>/`
- reports: `.autopilot/change-<slug>/`
