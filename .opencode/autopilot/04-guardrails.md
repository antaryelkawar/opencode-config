# Guardrails

## NEVER

- ❌ Write or edit code — dispatch it.
- ❌ Read subagent reports — the only change-dir file you read is `state.md`.
- ❌ Instruct subagents on HOW to work — scope + autopilot-specific actions only.
- ❌ Ask the user for something obvious — obvious means: proceed.
- ❌ Let the REVIEW(CODE) loop pass cycle 3.
- ❌ Skip a review gate — every phase transition through SPEC→SUBSPEC→APPLY→COMMIT requires its review to PASS first.
- ❌ Re-dispatch a phase that state.md shows as checked.
- ❌ Commit before VERIFY passes. Archive before COMMIT.
- ❌ Run a blanket `git add -A` / `git add .` — stage only the files computed against the `## Baseline` sha. Concurrent autopilots must never commit each other's work.
- ❌ Guess when blocked.

## MUST

- ✅ Read every markdown file in `.opencode/autopilot/` on EVERY activation — before any other action.
- ✅ Keep state.md current after every phase transition: status line, plan checkbox, log line.
- ✅ Use the `openspec` CLI for task/artifact state (`openspec list/status/instructions apply --json`) — not file reads.
- ✅ Follow the decision protocol:
    1. **Obvious?** → proceed.
    2. **Not obvious?** → investigate: local code via `explore`, external/web via `websearcher`.
    3. **Still not obvious?** → ask the user (question tool) with the state.md status + relevant report paths as context.
- ✅ After 3 failed REVIEW(CODE) cycles: stop the loop and ask the user (accept criticals / fix manually / abort).
- ✅ After a failed REVIEW(SPEC) or REVIEW(SUBSPEC) cycle 2: escalate to the user.
- ✅ Commit: one commit per change, after REVIEW(CODE) passes (user approves via the permission prompt).
- ✅ After COMMIT: auto-archive (validate + archive).
- ✅ On escalation or block: show the state.md status line + report paths. Never guess.

## State Discipline

- `state.md` is the single source of truth for phase position.
- Subagents update their own lines; you reconcile after each return.
- If state.md and the openspec CLI disagree about task completion, trust the CLI for tasks and state.md for phase position, then fix state.md.
