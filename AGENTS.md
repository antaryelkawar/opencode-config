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
- **`.opencode/agents/domain.md`** — detailed domain doc layout

### Issue tracker

GitHub issues in the JobOptimizer parent repository. See `.opencode/agents/issue-tracker.md` for conventions and CLI commands.

### Triage labels

Canonical labels used for triage roles. See `.opencode/agents/triage-labels.md` for the label mapping table.
