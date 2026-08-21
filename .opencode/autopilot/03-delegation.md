# Delegation Rules

When implementing tasks during `/opsx:apply`, dispatch each task to the matching subagent. Never implement code yourself.

## Available Subagents

| Subagent | Domain | Model | Access | Notes |
|----------|--------|-------|--------|-------|
| `impl-worker` | Implementation orchestration | reasoning | full | Delegates to impl-worker-cheap, audits results |
| `impl-worker-cheap` | Single task execution | agentic-free | full | Hidden — only invoked by impl-worker |
| `architect` | System design, interfaces, codebase structure | design | ask | |
| `debugger` | Bug fixing, root cause analysis | agentic | full | |
| `qa-engineer` | Testing, edge cases, quality assurance | agentic | full | |
| `db-expert` | Database, SQL, migrations | agentic | full | |
| `devops` | CI/CD, Docker, infrastructure | generalist | full | |
| `researcher` | Technical research, library analysis | speed-cheapest | read+write | |
| `docs-writer` | Documentation, README, guides | generalist | write/edit | |
| `code-reviewer` | Code review, quality checks | agentic | read+write | |
| `security-auditor` | Security audit, vulnerabilities | agentic | read+write | |
| `explore` | Investigation, codebase analysis | speed-cheapest | read+write | |
| `general` | Frontend, config, scripts, everything else | generalist | full | |

## Implementation Tasks — Always Through impl-worker

**All implementation tasks go through `impl-worker`.** The autopilot never calls `impl-worker-cheap` directly.

The flow is:
```
autopilot → impl-worker → impl-worker-cheap → code changes
```

`impl-worker` breaks work into chunks, delegates each to `impl-worker-cheap`, and audits results on return.

## Task Classification

Match task description keywords to subagent:

| Keywords | Dispatch to |
|----------|-------------|
| `Java`, `Spring`, `Maven`, `backend`, `REST`, `JPA`, `Entity`, `Repository`, `Service`, `Controller`, `pom.xml`, `@Service`, `@Controller`, `@Repository` | `impl-worker` |
| `implement`, `build`, `create`, `add`, `write code`, `feature`, `refactor` (code changes) | `impl-worker` |
| `design`, `architecture`, `interface`, `structure`, `system design`, `UML`, `contract` | `architect` |
| `bug`, `fix`, `regression`, `error`, `crash`, `root cause`, `issue` | `debugger` |
| `test`, `testing`, `qa`, `edge case`, `integration test`, `coverage`, `spec` (testing) | `qa-engineer` |
| `database`, `sql`, `query`, `migration`, `schema`, `db`, `index` | `db-expert` |
| `ci/cd`, `docker`, `infrastructure`, `deploy`, `pipeline`, `github actions`, `container` | `devops` |
| `research`, `library`, `api`, `feasibility`, `summary`, `comparison` | `researcher` |
| `documentation`, `README`, `docs`, `guide`, `wiki`, `markdown` (non-spec) | `docs-writer` |
| `review`, `code review`, `inspect`, `audit quality`, `refactor` | `code-reviewer` |
| `security`, `vulnerability`, `CVE`, `auth`, `OAuth`, `permission`, `encrypt`, `XSS`, `SQL injection` | `security-auditor` |
| `investigate`, `analyze`, `spike`, `compare`, `trace`, `find`, `explore` | `explore` |
| Everything else (frontend, UI, CSS, config, scripts, TypeScript, build, plugins) | `general` |

## Output File Convention

Every task must include a unique output file **name** in the prompt. All subagents write their output to `.tmp/<name>` at the workspace root (creating `.tmp/` if missing) and ask the user for signoff.

**Name format:** `<task-number>-<kebab-slug>.md`

The autopilot generates this name before dispatching. After the subagent returns, verify the file was created AND read its content to audit quality:
```powershell
Test-Path ".tmp/<task-number>-<kebab-slug>.md"
```

## Token Optimization — Describe, Don't Code

When delegating to impl-worker, describe WHAT needs to change and WHY — do NOT provide code snippets or exact implementations. This wastes tokens.

**Bad (wastes tokens):**
```
Create User entity with this code:
```java
@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    ...
}
```
```

**Good (describes the change):**
```
Create User entity in src/main/java/.../entity/User.java
Fields: id, email, name, createdAt
Use @Entity, @Data, @Table(name="users")
See openspec/changes/add-auth/specs/ for requirements
Write tests first, then implementation. All tests must pass.
```

## How to Delegate

```
Generate output file name first, then use the task tool (the subagent writes to `.tmp/<name>`):
  subagent_type: <matching subagent>
  description: "3-5 word summary"
  prompt: |
    OUTPUT_FILE=<task-number>-<slug>.md

    Task: <task description>
    Context: <relevant specs, design decisions, file paths>
    Instructions: <what to do — describe the change, don't provide code>
```

### Example

```
Task: "3.1 Create JPA entity for User"

→ generate: 1-user-entity.md

→ dispatch to impl-worker:
   subagent_type: "impl-worker"
   description: "Create User entity"
   prompt: |
      OUTPUT_FILE=1-user-entity.md

     Task: Create JPA entity for User
     Context: This is the core entity for authentication.
              See openspec/changes/add-auth/specs/ for field requirements.
     Instructions:
     - Create User entity in src/main/java/.../entity/User.java
     - Fields: id, email, name, createdAt
     - Use @Entity, @Data, @Table(name="users")
     - Write tests first, then implementation
     - All tests must pass before you finish

→ impl-worker breaks into chunks, delegates to impl-worker-cheap
→ impl-worker audits output, fixes minor issues, reports back
→ autopilot verifies .tmp/1-user-entity.md exists, reads content to audit quality
→ Mark task complete
```

## Audit Pattern — Read and Verify

After each subagent returns, the autopilot should:
1. Verify the output file exists: `Test-Path ".tmp/<name>"`
2. Read the output file content to check quality
3. If quality is acceptable: mark task complete
4. If minor issues: fix inline
5. If major issues: re-delegate to impl-worker with clarification

## When NOT to Delegate

- Simple changes (< 5 lines) — do inline
- Context-heavy tasks requiring full conversation awareness — do inline
- Spec/artifact updates — always inline (planning, not implementation)
- User explicitly says not to delegate
