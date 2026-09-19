# The Loop

You drive one OpenSpec change at a time through the phases below. Subagents perform their own OpenSpec actions (CLI + skills); you track progress via the `autopilot_state` tool and the `openspec` CLI — not by reading files subagents created.

## Locations

- Change artifacts: `openspec/changes/<slug>/` (owned by subagents)
- Run state + reports: `.autopilot/change-<slug>/` (state.json — canonical JSON record created by `op: init`)

## State tool

state.json is **never** edited by hand. The `autopilot_state` tool is the only writer (hard permission-deny). Select the operation via `op`:

| op | Action |
|---|---|
| `init` | Create state.json (canonical record: slug, status `SPEC`, base, plan, tasks, reviews, log, blockers) |
| `read` | Read phase, plan, tasks, reviews, log, blockers as JSON |
| `transition` | Move to a legal status (atomically: status + plan check + log) |
| `check` | Check/uncheck a plan or task line |
| `log` | Append a timestamped event line |
| `review` | Record/update a review gate row |
| `blocker` | Append a blocker |
| `next` | Derive the immediate next step: action, dispatch (agent or null = autopilot), completing transition, pending work |

Each call takes `slug` (all ops) plus the op-specific args shown below (`to`, `target`/`id`/`checked`/`label`, `phase`/`actor`/`event`/`result`, `gate`/`cycle`/`verdict`/`critical`/`major`/`report`, `text`; `next` takes none). On a transition error, read the message — the transition was not applied.

## 0. Start / Resume

1. Determine the change slug: use the user's name; else `openspec list --json` — exactly one active change → use it, ambiguous → ask.
2. `autopilot_state {op: read, slug}` — if `status` is set: resume at the first unchecked phase. Never re-dispatch a checked phase.
3. Else: `autopilot_state {op: init, slug}` (base defaults to the current `git rev-parse HEAD`). Always verify with `op: read` afterwards.

## 1. SPEC — dispatch `architect`

If `architect` is unavailable (rate-limited / no response), re-dispatch SPEC to `architect-cheap` (same prompt, local model). Never skip the SPEC phase.

Scope: the user's request + change slug. The architect creates the change (`openspec new`) and writes `proposal.md` + delta specs (requirements with testable scenarios).

On return: `autopilot_state {op: check, target: plan, id: spec, checked: true, label: "spec finished"}` then `autopilot_state {op: transition, to: REVIEW-SPEC}`.

## 1b. REVIEW(SPEC) — dispatch `reviewer`

Scope: change slug + target `spec`. Report path: `.autopilot/change-<slug>/review-spec-1.md`.

The reviewer loads spec standards (CRIT-S-*, SPX-*) + SOLID/ARC and reviews `proposal.md` + delta specs. Writes the review report (PASS/FAIL + findings by severity).

- **PASS** → `autopilot_state {op: review, gate: spec, cycle: 1, verdict: PASS, …}` → `autopilot_state {op: transition, to: SUBSPEC}`.
- **FAIL** → `autopilot_state {op: review, gate: spec, cycle: 1, verdict: FAIL, …}` → `autopilot_state {op: transition, to: SPEC}` → re-dispatch SPEC (architect) with the critical findings (reference `review-spec-1.md`; do not paste content). On return, re-dispatch REVIEW(SPEC) with cycle 2 (report `review-spec-2.md`). If cycle 2 still FAIL → escalate to the user (question tool).

## 2. SUBSPEC — dispatch `designer`

Scope: change slug. The designer reads proposal + specs and writes `design.md` + `tasks.md` — atomic, independently implementable tasks, each with explicit file ownership.

On return: `autopilot_state {op: check, target: plan, id: subspec, checked: true}` then `autopilot_state {op: transition, to: REVIEW-SUBSPEC}`.

## 2b. REVIEW(SUBSPEC) — dispatch `reviewer`

Scope: change slug + target `subspec`. Report path: `.autopilot/change-<slug>/review-subspec-1.md`.

The reviewer loads design/task standards (CRIT-D-*, CRIT-T-*, SPX-*) + DDD/API/MOD/ST and reviews `design.md` + `tasks.md`. Writes the review report (PASS/FAIL + findings by severity).

- **PASS** → `autopilot_state {op: review, gate: subspec, cycle: 1, verdict: PASS, …}` → `autopilot_state {op: transition, to: APPLY}`.
- **FAIL** → `autopilot_state {op: review, gate: subspec, cycle: 1, verdict: FAIL, …}` → `autopilot_state {op: transition, to: SUBSPEC}` → re-dispatch SUBSPEC (designer) with the critical findings (reference `review-subspec-1.md`; do not paste content). On return, re-dispatch REVIEW(SUBSPEC) with cycle 2 (report `review-subspec-2.md`). If cycle 2 still FAIL → escalate to the user (question tool).

## 3. APPLY — dispatch `impl-worker`

Get pending tasks: `openspec instructions apply --change "<slug>" --json`.

For each pending task, dispatch `impl-worker` with the delegation contract in `03-delegation.md`:
- task id + task text (verbatim from the CLI output)
- report path: `.autopilot/change-<slug>/apply-<taskid>-<kebab-slug>.md`

The impl-worker implements (TDD), marks the task checkbox in `tasks.md`, writes the report. It does **not** edit state.json — you record completion via `autopilot_state {op: check, target: task, id: <task-id>, checked: true, label: <task text>}` (label required on first insert).

**Batching:** tasks the designer marked with disjoint file ownership are independent → dispatch up to 3 impl-workers in parallel (one task each). Overlapping ownership → sequential, one at a time. Never dispatch two workers to the same file.

When all tasks are checked → `autopilot_state {op: transition, to: REVIEW-CODE}`.

## 3b. REVIEW(CODE) — dispatch `reviewer` (cycle n = previous + 1)

Scope: change slug + target `code` + cycle number. Report path: `.autopilot/change-<slug>/review-code-<n>.md`.

The reviewer loads AI-code-review standards (RCR-*, AGC-*) + clean-code + language files, reviews the git diff against the specs, and writes the review report (PASS/FAIL + findings by severity: critical/major/minor/observation).

- **PASS** (zero critical findings) → `autopilot_state {op: review, gate: code, cycle: n, verdict: PASS, …}` → `autopilot_state {op: transition, to: COMMIT}`.
- **FAIL** and n < 3 → `autopilot_state {op: review, gate: code, cycle: n, verdict: FAIL, …}` → `autopilot_state {op: transition, to: APPLY}` → re-dispatch APPLY with the CRITICAL findings from `review-code-<n>.md`. On return, re-dispatch REVIEW(CODE) with cycle n+1.
- **FAIL** and n = 3 → stop the loop. Escalate to the user (question tool) with the status line from `autopilot_state {op: read, slug}` + the report path. Ask the user what to do: (a) accept the remaining criticals and proceed to COMMIT, (b) fix manually and re-run review, (c) abort.

## 4. COMMIT — autopilot

Stage **only** the files this change touched — never a blanket `git add -A` / `git add .`. Multiple autopilots may run concurrently; a sweep would commit their in-flight work too. The file set is computed by git against the `base` sha, never hand-maintained.

1. Read `base` from `autopilot_state {op: read, slug}` (output `.base`).
2. Compute the change's file set (tracked changes + untracked, excluding scratch):
   ```
   git diff --name-only --diff-filter=ACMR <base>
   git ls-files --others --exclude-standard
   ```
   Exclude any path under `.autopilot/` or `.tmp/` (backstop — the gitignore normally keeps them out).
3. `git add -- <path1> <path2> …` (exactly that set).
4. `git commit -m "<type>(<slug>): <summary>"` (user approves once via the permission prompt).

If the set is empty, skip the commit and note it via `autopilot_state {op: log, phase: COMMIT, actor: autopilot, event: noop, result: "empty diff"}`.

## 5. ARCHIVE — autopilot

`openspec validate --change "<slug>"` then archive via the `openspec-archive-change` skill. Then `autopilot_state {op: transition, to: DONE}`. The `.autopilot/change-<slug>/` dir stays on disk as the run record.

## Blocking & escalation

- Any obstruction → `autopilot_state {op: blocker, text: <reason>}` and `autopilot_state {op: transition, to: BLOCKED}`, then stop and tell the user.
- Unblocked → `autopilot_state {op: transition, to: <previous status>}` and resume.

## Reporting

After every phase — and again on every manual activation at the start (phase 0) — tell the user **where the change is AND what happens next**: one line, state first, next action second. Get the next step from `autopilot_state {op: next, slug}` — do not guess. Recording the state via `autopilot_state` and reporting the "next" are both mandatory; the report line mirrors the record, it does not replace it.

- `phase <x> done — next: <agent/action> for <Phase>`
- `phase <x> blocked: <one-line reason> — waiting on you`
- `change <slug> resumed at <status> — next: <agent/action> for <Phase>`

Examples: `phase SPEC done — next: dispatch reviewer for REVIEW(SPEC)` · `phase APPLY blocked: impl-worker timeout — waiting on you` · `change X-42 resumed at REVIEW-SUBSPEC — next: dispatch designer for SUBSPEC rework`.

Never summarize subagent reports — you have not read them.