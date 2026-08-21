# The Loop

You drive one OpenSpec change at a time through the phases below. Subagents perform their own OpenSpec actions (CLI + skills); you track progress via state.md and the `openspec` CLI — not by reading files subagents created.

## Locations

- Change artifacts: `openspec/changes/<slug>/` (owned by subagents)
- Run state + reports: `.autopilot/change-<slug>/` (state.md from the template in `.opencode/autopilot/state-template.md`)

## 0. Start / Resume

1. Determine the change slug: use the user's name; else `openspec list --json` — exactly one active change → use it, ambiguous → ask.
2. If `.autopilot/change-<slug>/state.md` exists: read it, resume at the first unchecked phase. Never re-dispatch a checked phase.
3. Else: create `.autopilot/change-<slug>/` and state.md from the template (fill `<slug>`, status `SPEC`). Record `base:` in `## Baseline` as the current `git rev-parse HEAD` (the commit this change builds on). This is the reference point for scoping the commit.

## 1. SPEC — dispatch `architect`

Scope: the user's request + change slug. The architect creates the change (`openspec new`) and writes `proposal.md` + delta specs (requirements with testable scenarios).

On return: read state.md — spec line checked → status `SUBSPEC`.

## 2. SUBSPEC — dispatch `designer`

Scope: change slug. The designer reads proposal + specs and writes `design.md` + `tasks.md` — atomic, independently implementable tasks, each with explicit file ownership.

On return: read state.md → status `APPLY`.

## 3. APPLY — dispatch `impl-worker`

Get pending tasks: `openspec instructions apply --change "<slug>" --json`.

For each pending task, dispatch `impl-worker` with the delegation contract in `03-delegation.md`:
- task id + task text (verbatim from the CLI output)
- report path: `.autopilot/change-<slug>/apply-<taskid>-<kebab-slug>.md`
- state.md instruction: check the task line in `## Tasks`, append a log line

The impl-worker implements (TDD), marks the task checkbox in `tasks.md`, writes the report, updates state.md.

**Batching:** tasks the designer marked with disjoint file ownership are independent → dispatch up to 3 impl-workers in parallel (one task each). Overlapping ownership → sequential, one at a time. Never dispatch two workers to the same file.

When all tasks are checked → status `VERIFY`.

## 4. VERIFY — dispatch `verifier` (cycle n = previous + 1)

Scope: change slug + cycle number. Report path: `.autopilot/change-<slug>/verify-<n>.md`.

The verifier runs the real tests, reviews the code against the specs, and writes the verdict (PASS/FAIL + CRITICAL findings).

- **PASS** → status `COMMIT`.
- **FAIL** and n < 3 → re-dispatch APPLY. Scope = the CRITICAL findings from `verify-<n>.md` (reference the report path; do not paste its content).
- **FAIL** and n = 3 → stop the loop. Escalate to the user (question tool) with the status line from state.md + the report path.

## 5. COMMIT — autopilot

Stage **only** the files this change touched — never a blanket `git add -A` / `git add .`. Multiple autopilots may run concurrently; a sweep would commit their in-flight work too. The file set is computed by git against the `base` sha, never hand-maintained.

1. Read `base:` from `## Baseline` in state.md.
2. Compute the change's file set (tracked changes + untracked, excluding scratch):
   ```
   git diff --name-only --diff-filter=ACMR <base>
   git ls-files --others --exclude-standard
   ```
   Exclude any path under `.autopilot/` or `.tmp/` (backstop — the gitignore normally keeps them out).
3. `git add -- <path1> <path2> …` (exactly that set).
4. `git commit -m "<type>(<slug>): <summary>"` (user approves once via the permission prompt).

If the set is empty, skip the commit and note it in the log.

## 6. ARCHIVE — autopilot

`openspec validate --change "<slug>"` then archive via the `openspec-archive-change` skill. Mark state.md `DONE`. The `.autopilot/change-<slug>/` dir stays on disk as the run record.

## Reporting

After each phase, one line to the user: `phase <x> done` or `phase <x> failed: <one-line reason>`. Never summarize subagent reports — you have not read them.
