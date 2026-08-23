# Git Safety Rules for AI Agents

Permission rules use glob matching on parsed command segments. Every deny rule
also covers the `rtk git ...` form (the rtk plugin rewrites git commands before
permission evaluation), so `git reset --hard HEAD` is blocked whether the agent
writes it raw or as `rtk git reset --hard HEAD`.

## Hard-Blocked (deny)

These commands are denied and cannot run under any circumstance:

- `git push --force*` / `git push -f*` — force-push rewrites remote history
- `git reset --hard*` — discards uncommitted work permanently
- `git clean *` (except `git clean -n*`) — deletes untracked files
- `git checkout .` / `git checkout --*` / `git checkout -f*` — discards working tree
- `git restore .` / `git restore --*` — discards working tree
- `git branch -D*` — force-deletes a branch
- `git stash drop*` / `git stash clear*` — destroys stash contents

## Ask Before Running (ask)

- `git push*` — any form of push (plain or with flags) prompts for approval
  before running. This is the line between local and remote: the agent must
  confirm with the user before publishing anything.

## Free (allowed)

Everything else runs without prompting:

- `git commit*` — local, fully recoverable via reflog
- `git merge*` / `git merge --abort` — local, recoverable
- `git rebase*` / `git rebase --abort` — local, recoverable via reflog
- `git reset` (mixed/soft) / `git reset --soft*` — unstage or rewind branch pointer, recoverable
- `git checkout <branch>` / `git switch*` — branch switching (not discard)
- `git clean -n*` — dry-run, safe
- `git stash push*` / `git stash pop*` / `git stash list*` — stash management
- `git branch`, `git branch -d*` (safe delete), `git branch -m*` — branch management
- `git status`, `git log`, `git diff`, `git show`, `git fetch`, `git remote` — read-only

## Safe Alternatives

| Instead of | Use |
|---|---|
| `git reset --hard` | `git stash push -m "context: <reason>"` to save work first |
| `git checkout .` | `git stash push -m "context: <reason>"` to save before switching |
| `git push --force` | Blocked. Use `git revert` to undo remote commits |
| `git branch -D` | `git branch -d` if merged; otherwise push it first |

## Commit Hygiene

- Commit often — before risky operations (pull, merge, branch switch)
- Keep commits atomic — one logical change per commit
- Never amend commits that have been pushed
- Use `git commit --amend` only for unpushed commits
- Check for debug code, TODOs, or commented-out code
- Verify no secrets or keys are being committed (check `.env*` patterns)
- Run tests before committing

## Stash Discipline

- Always use `git stash push -m "<reason>"` — never stash without a message
- Before stashing, check `git status --porcelain` to understand what will be stashed
- After `git stash pop`, verify the working tree is clean with `git status`
- Prefer multiple named stashes over a single unnamed one

## Workflow Safety

1. **Check status first** — `git status --porcelain` before any git operation
2. **Branch for experiments** — never work directly on main/develop
3. **Use `git fetch` before `git pull`** — review incoming changes before merging
4. **Reflog is your safety net** — if work seems lost, check `git reflog` immediately
5. **Verify after operations** — after any branch switch, reset, or pop, verify with `git status`
6. **No destructive ops on shared branches** — never force-push, rebase, or hard-reset branches others may have based work on

## Recovery Checklist

If something goes wrong:

1. Don't panic — don't run more destructive commands
2. Run `git reflog` to find lost commits
3. Use `git stash list` to check if work was stashed
4. Check `git log --all --oneline` for dangling commits
5. If a file was deleted, check `git fsck --lost-found`
