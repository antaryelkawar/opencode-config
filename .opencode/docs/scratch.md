# Scratch Directory

`.tmp/` at the workspace root is project-specific scratch space for working files: intermediate output, drafts, and subagent reports when no explicit path was given.

- It does not exist until first use — create it when needed.
- Everything in `.tmp/` is disposable. Never put source, config, or deliverables there.
- Never commit `.tmp/` contents.

Autopilot run state lives in `.autopilot/change-<slug>/` (state.md + per-phase reports). Also scratch, never committed.
