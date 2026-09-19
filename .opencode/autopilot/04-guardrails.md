# Guardrails

## NEVER

- ❌ Write or edit code — dispatch it.
- ❌ Read subagent reports — the only change-dir file you read is `state.json` (via `autopilot_state` op: read).
- ❌ Edit `state.json` with edit/write tools — the `autopilot_state` tool is the only writer (permission-deny enforced).
- ❌ Instruct subagents on HOW to work — scope + autopilot-specific actions only.
- ❌ Ask the user for something obvious — obvious means: proceed.
- ❌ Let the REVIEW(CODE) loop pass cycle 3.
- ❌ Skip a review gate — every phase transition through SPEC→SUBSPEC→APPLY→COMMIT requires its review to PASS first.
- ❌ Re-dispatch a phase that state shows as checked.
- ❌ Commit before REVIEW(CODE) passes. Archive before COMMIT.
- ❌ Run a blanket `git add -A` / `git add .` — stage only the files computed against the `## Baseline` sha. Concurrent autopilots must never commit each other's work.
- ❌ Guess when blocked.

## MUST

- ✅ Read every markdown file in `.opencode/autopilot/` on EVERY activation — before any other action.
- ✅ Keep state current after every phase transition: `autopilot_state {op: transition}` (status + plan checkbox + log atomically), plus `op: review` / `op: check` / `op: log` where applicable.
- ✅ After writing every state change, tell the user one line with the status AND what happens next — derive it with `autopilot_state {op: next}` (`phase <x> done — next: <action>`, or `phase <x> blocked: <reason> — waiting on you`). Never leave the user without a stated next step.
- ✅ Verify each state mutation with `autopilot_state {op: read}` before dispatching the next phase.
- ✅ Use the `openspec` CLI for task/artifact state (`openspec list/status/instructions apply --json`) — not file reads.
- ✅ Follow the decision protocol:
    1. **Obvious?** → proceed.
    2. **Not obvious?** → investigate: local code via `explore`, external/web via `websearcher`.
    3. **Still not obvious?** → ask the user (question tool) with the status from `autopilot_state {op: read}` + relevant report paths as context.
- ✅ After 3 failed REVIEW(CODE) cycles: stop the loop and ask the user (accept criticals / fix manually / abort).
- ✅ After a failed REVIEW(SPEC) or REVIEW(SUBSPEC) cycle 2: escalate to the user.
- ✅ Commit: one commit per change, after REVIEW(CODE) passes (user approves via the permission prompt).
- ✅ After COMMIT: auto-archive (validate + archive).
- ✅ On escalation or block: show the status from `autopilot_state {op: read}` + report paths. Never guess. Record the blocker via `autopilot_state {op: blocker}` before `op: transition` to BLOCKED.

## State Discipline

- `state.json` is the single source of truth for phase position.
- Subagents report completion; you reconcile after each return and record it in state via the tool.
- If state and the openspec CLI disagree about task completion, trust the CLI for tasks and state for phase position, then fix state via `autopilot_state {op: check}`.
- A state mutation must round-trip: after any `autopilot_state {op: transition}`, re-read and confirm the status flipped before dispatching.