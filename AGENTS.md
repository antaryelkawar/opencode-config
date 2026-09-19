## Tool limitations

### `glob` ignores dot-prefixed directories

The `glob` tool cannot match patterns starting with a literal dot (e.g., `.opencode/**/*`, `.agents/**/*`). Patterns like `docs/**/*` work fine.

**Workaround:** set the `path` parameter directly to the dot directory, or use `pattern=*` which incidentally recurses into hidden dirs.

```
# ❌ fails — returns nothing
glob(pattern=".opencode/skills/**")

# ✅ works
glob(pattern="**/*", path=".opencode/skills")
```

## Agent skills

Skills are loaded from `.agents/skills/` and `.opencode/skills/` in the opencode-config repo. The GitHub-sourced skills are pinned in `skills-lock.json` at the opencode-config root; the local `.opencode/skills/` directory holds repo-specific skills.

### Domain docs

- **`CONTEXT.md`** at the repo root (parent repo, JobOptimizer)
- **`docs/adr/`** — Architecture Decision Records
- **`.opencode/docs/domain.md`** — detailed domain doc layout

## Agent roster

Agents live in `opencode.jsonc` (`agent` block) with their prompts in `.opencode/prompts/`. The **`build`** agent is the interactive primary; **`plan`** is the read-only default. The full routing table and per-agent notes live in `.opencode/prompts/subagent-routing.md` (single source of truth — do not duplicate it here).

`impl-worker-cheap` and `architect-cheap` are hidden internal agents. `impl-worker-cheap` is spawned only by `impl-worker`; `architect-cheap` is the local-model fallback spawned only by `autopilot` when `architect` is rate-limited.

## Browser MCP scoping (UI agents only)

Two MCP servers power the UI agents: **`chrome-devtools`** (Google — perf traces, Lighthouse, console, network, device emulation) and **`playwright`** (Microsoft — accessibility-tree, multi-browser, mobile emulation). MCP servers have no per-agent *enable*, so they spawn at startup for everyone — but their **tools are hidden globally** and re-enabled per agent:

```jsonc
// top-level: hide the browser tools from every agent
"tools": { "chrome-devtools*": false, "playwright*": false }

// ui-impl-worker + ui-reviewer: re-enable only for them
"agent": { "ui-impl-worker": { "tools": { "chrome-devtools*": true, "playwright*": true } } }
```

MCP tool names are prefixed with the server name (e.g. `chrome-devtools_navigate_page`), so the `chrome-devtools*` / `playwright*` globs scope cleanly. Net effect: only `ui-impl-worker` and `ui-reviewer` can drive a browser. Both run `--headless`.

### Issue tracker

GitHub issues in the JobOptimizer parent repository. See `.opencode/docs/issue-tracker.md` for conventions and CLI commands.

### Triage labels

Canonical labels used for triage roles. See `.opencode/docs/triage-labels.md` for the label mapping table.
