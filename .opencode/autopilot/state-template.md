# <slug>

status: <SPEC | REVIEW-SPEC | SUBSPEC | REVIEW-SUBSPEC | APPLY | REVIEW-CODE | COMMIT | ARCHIVE | DONE | BLOCKED>

## Plan
- [ ] spec          — architect
- [ ] review-spec   — reviewer (cycle 0)
- [ ] subspec       — designer
- [ ] review-subspec — reviewer (cycle 0)
- [ ] apply         — impl-worker (0/N tasks)
- [ ] review-code   — reviewer (cycle 0)
- [ ] commit        — autopilot
- [ ] archive       — autopilot

## Tasks
<!-- Mirror of openspec/changes/<slug>/tasks.md. Subagents check their own line. -->

## Reviews
| gate | cycle | verdict | critical | major | report |
|------|-------|---------|----------|-------|--------|
| spec |       |         |          |       |        |
| subspec |    |         |          |       |        |
| code |       |         |          |       |        |

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
