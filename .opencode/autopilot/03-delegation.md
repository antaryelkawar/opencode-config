# Delegation Rules

When implementing tasks during `/opsx:apply`, dispatch each task to the matching subagent. Never implement code yourself.

## Available Subagents

| Subagent | Domain | Model | Access |
|----------|--------|-------|--------|
| `impl-worker` | Java/Spring, Maven, backend implementation | agentic | full |
| `architect` | System design, interfaces, codebase structure | reasoning | ask |
| `debugger` | Bug fixing, root cause analysis | reasoning | full |
| `qa-engineer` | Testing, edge cases, quality assurance | agentic | full |
| `db-expert` | Database, SQL, migrations | agentic | full |
| `devops` | CI/CD, Docker, infrastructure | generalist | full |
| `researcher` | Technical research, library analysis | speed | read+write |
| `docs-writer` | Documentation, README, guides | generalist | write/edit |
| `code-reviewer` | Code review, quality checks | reasoning | read+write |
| `security-auditor` | Security audit, vulnerabilities | reasoning | read+write |
| `explore` | Investigation, codebase analysis | speed | read+write |
| `general` | Frontend, config, scripts, everything else | generalist | full |

## Task Classification

Match task description keywords to subagent:

| Keywords | Dispatch to |
|----------|-------------|
| `Java`, `Spring`, `Maven`, `backend`, `REST`, `JPA`, `Entity`, `Repository`, `Service`, `Controller`, `pom.xml`, `@Service`, `@Controller`, `@Repository` | `impl-worker` |
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

Every task must include a unique output file path in the prompt. The subagent writes ALL results to this file and asks the user for signoff.

**Path format:** `openspec/changes/<change-name>/output/<task-number>-<kebab-slug>.md`

The autopilot generates this path before dispatching. After the subagent returns, verify the file was created:
```bash
Test-Path "openspec/changes/<change-name>/output/<task-number>-<kebab-slug>.md"
```

**Do NOT read the output file content.** Only verify it exists. The signoff process is the quality gate.

## How to Delegate

```
Generate output file path first, then use the task tool:
  subagent_type: <matching subagent>
  description: "3-5 word summary"
  prompt: |
    OUTPUT_FILE=openspec/changes/<change-name>/output/<task-number>-<slug>.md

    Task: <task description>
    Context: <relevant specs, design decisions, file paths>
    Instructions: <what to do>
```

### Example

```
Task: "3.1 Create JPA entity for User"

→ generate: openspec/changes/add-auth/output/1-user-entity.md

→ dispatch to impl-worker:
   subagent_type: "impl-worker"
   description: "Create User entity"
   prompt: |
     OUTPUT_FILE=openspec/changes/add-auth/output/1-user-entity.md

     Create User entity in src/main/java/.../entity/User.java
     Fields: id, email, name, createdAt
     Use @Entity, @Data, @Table(name="users")
     See openspec/changes/add-auth/specs/ for requirements
     Write tests first, then implementation. All tests must pass.

→ impl-worker writes output to file, asks user for signoff
→ Verify file exists: Test-Path "openspec/changes/add-auth/output/1-user-entity.md"
→ Mark task complete
```

## When NOT to Delegate

- Simple changes (< 5 lines) — do inline
- Context-heavy tasks requiring full conversation awareness — do inline
- Spec/artifact updates — always inline (planning, not implementation)
- User explicitly says not to delegate
