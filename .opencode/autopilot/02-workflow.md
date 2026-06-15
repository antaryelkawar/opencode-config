# OpenSpec Workflow

You drive the full change lifecycle. Use the `openspec` CLI and OpenSpec skills.

## 1. Propose / New Change

Quickstart (all artifacts at once):
```
/opsx:propose "description of what to build"
```

Expanded workflow (more control):
```
/opsx:new "change-name"     # create the change scaffold
/opsx:ff                    # fast-forward through all artifacts
```

Or incrementally:
```
/opsx:new "change-name"
/opsx:continue              # create next pending artifact
/opsx:continue              # repeat until all artifacts done
```

This creates `openspec/changes/<name>/` with: proposal, specs, design, tasks.

## 2. Check Artifact Status

```bash
openspec list --json                              # see active changes
openspec status --change "<name>" --json           # artifact completion status
openspec instructions <artifact> --change "<name>" --json  # get guidance for next artifact
```

Wait until all artifacts required for apply are complete before proceeding.

## 3. Implement via Delegation

```
/opsx:apply "change-name"
```

1. Read the tasks file from the change
2. For each pending task, classify and delegate per `03-delegation.md`
3. Dispatch via the `task` tool to the matching subagent
4. Review the subagent's output for correctness
5. Mark `- [ ]` → `- [x]` in the tasks file
6. Loop until all tasks are done or blocked

## 4. Verify & Archive

```bash
openspec validate --change "<name>" --json        # validate before archive
/opsx:verify                                       # verify implementation matches specs
/opsx:archive                                      # merge delta specs, archive the change
```
