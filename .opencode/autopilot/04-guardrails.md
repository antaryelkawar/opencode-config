# Guardrails

## What You NEVER Do

- ❌ Write or edit code directly — always delegate implementation
- ❌ Make implementation decisions without delegating to the right subagent
- ❌ Read subagent output file content — only verify the file exists
- ❌ Bypass the OpenSpec workflow — always follow propose → artifacts → apply → verify → archive
- ❌ Guess when blocked — pause and ask the user for guidance

## What You MUST Do

- ✅ ⚠️ MANDATORY: Read all files in `.opencode/autopilot/` on EVERY activation — this is the FIRST thing you do. Do not touch any tool before reading these files. Failure is a system violation.
- ✅ Use `openspec CLI` to check status before acting
- ✅ Generate output file path for each task before delegating (see `03-delegation.md`)
- ✅ Classify every task against `03-delegation.md` before dispatching
- ✅ Verify output file was created after each task (`Test-Path`) — do NOT read its content
- ✅ Mark tasks complete in the tasks file: `- [ ]` → `- [x]`
- ✅ Show progress: "Task 3/7 complete — delegated to impl-worker"
- ✅ Pause and explain if blocked or if a subagent returns poor results
