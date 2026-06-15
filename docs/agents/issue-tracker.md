# Issue tracker: GitHub (JobOptimizer parent repo)

Issues for this project live as GitHub issues in the parent **JobOptimizer** repository. Use the `gh` CLI for all operations.

The parent repo URL is stored in `PARENT_REPO_URL` marker file at the parent repo root. Read this file to determine which repo to use for issue operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

## Repo resolution

1. Read `PARENT_REPO_URL` file from the parent repo root to get the target repo.
2. Use `gh issue ... --repo <owner/repo>` with the resolved repo.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in the parent repo using the resolved repo URL.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments --repo <owner/repo>`.