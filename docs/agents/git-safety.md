# Git Safety Rules for AI Agents

## Destructive Operations — Blocked by Permission

The following git commands are **denied** by permission rules and cannot be executed:

- `git push` (all forms, including `--force`, `--force-with-lease`)
- `git reset` (all forms: `--hard`, `--soft`, `--mixed`)
- `git clean` (all forms: `-f`, `-fd`, `-nfd`)
- `git branch -D` (force delete)
- `git merge` (all forms)
- `git rebase` (all forms)
- `git checkout .` / `git checkout --` (discard working tree)
- `git restore .` / `git restore --` (discard working tree)
- `git stash drop` (without review)
- `git gc` (garbage collect)

## Safe Alternatives

| Instead of | Use |
|---|---|
| `git reset --hard` | `git stash push -m "context: <reason>"` to save work |
| `git clean -fd` | `git stash push -u -m "context: <reason>"` to stash including untracked |
| `git checkout .` | `git stash push -m "context: <reason>"` to save before switching |
| `git push --force` | Blocked. Use `git revert` if you need to undo remote commits |
| `git branch -D` | `git branch -d` if branch is merged; otherwise push it first |
| `git merge` | `git pull --rebase` or `git fetch` + review before merging |
| `git rebase` | `git merge` if on shared branch; rebase only on local feature branches |

## Commit Safety

- **`git commit` requires user approval** — always explain what you're committing and why before asking
- Never amend commits that have been pushed
- Use `git commit --amend` only for unpushed commits and only with user approval

## Stash Discipline

- Always use `git stash push -m "<reason>"` — never stash without a message
- Before stashing, check `git status --porcelain` to understand what will be stashed
- After `git stash pop`, verify the working tree is clean with `git status`
- Prefer multiple named stashes over a single unnamed one

## Workflow Safety

1. **Commit often** — before any risky operation (pull, merge, branch switch), commit or stash
2. **Dry-run destructive ops** — always use `-n` with `git clean` before actual execution
3. **Check status first** — always run `git status --porcelain` before any git operation to understand the current state
4. **Branch for experiments** — never work directly on main/develop. Create feature branches
5. **Use `git fetch` before `git pull`** — review incoming changes before merging
6. **Reflog is your safety net** — if work seems lost, check `git reflog` immediately
7. **Verify after operations** — after any branch switch, reset, or pop, verify with `git status` and check that key files exist
8. **No destructive ops on shared branches** — never push force, rebase, or reset branches others may have based work on

## Recovery Checklist

If something goes wrong:

1. Don't panic — don't run more destructive commands
2. Run `git reflog` to find lost commits
3. Use `git stash list` to check if work was stashed
4. Check `git log --all --oneline` for dangling commits
5. If a file was deleted, check `git fsck --lost-found`

## Pre-Commit Hygiene

- Run tests before committing: `mvn test` or equivalent
- Check for debug code, TODOs, or commented-out code
- Verify no secrets or keys are being committed (check `.env*` patterns)
- Keep commits atomic — one logical change per commit
