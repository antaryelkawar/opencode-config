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
2. For each pending task:
   a. Generate output file path: `openspec/changes/<name>/output/<n>-<slug>.md`
   b. Classify and delegate per `03-delegation.md` — include `OUTPUT_FILE=<path>` in the task prompt
   c. Dispatch via the `task` tool to the matching subagent
   d. After subagent returns, verify output file was created (check existence, don't read content):
      `Test-Path "openspec/changes/<name>/output/<n>-<slug>.md"`
   e. Mark `- [ ]` → `- [x]` in the tasks file
3. Loop until all tasks are done or blocked

## 4. Verify & Archive

```bash
openspec validate --change "<name>" --json        # validate before archive
/opsx:verify                                       # verify implementation matches specs
/opsx:archive                                      # merge delta specs, archive the change
```
