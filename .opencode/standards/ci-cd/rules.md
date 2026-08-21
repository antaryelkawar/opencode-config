---
scope: language-agnostic
tooling_deferral: true
override_precedence: project-local
---

# CI/CD Pipeline Rules

Standards for writing GitHub Actions pipelines optimized for **cost** and **wall-clock time**. Reducing the number of runs is not a goal — a fast, cheap pipeline that runs often beats a slow, expensive one that runs rarely.

## Runner Selection

### CD-001: Match Runner to Job
Each job MUST use the smallest runner that completes it in acceptable time. Over-provisioning is the single biggest source of wasted spend.

| Runner label | vCPUs | RAM | When to use |
|---|---|---|---|
| `ubuntu-slim` | 1 | 5 GB | Lint, format, static analysis, small builds |
| `ubuntu-latest` | 2 (private) / 4 (public) | 8 GB | Default for most builds and tests |
| Larger runners (16+ vCPU) | 16+ | 64+ GB | Heavy parallel test suites, monorepo builds |
| `macos-latest` | 3 (M1) | 7 GB | Only when macOS tooling is required |
| `windows-latest` | 2 (private) / 4 (public) | 8 GB | Only when Windows tooling is required |

**Compliant:**
```yaml
lint:
  runs-on: ubuntu-slim
test:
  runs-on: ubuntu-latest
```

**Non-compliant:**
```yaml
lint:
  runs-on: macos-latest  # 10x cost for a linter
```

### CD-002: Gate Expensive Runners Behind Filters
Jobs on macOS or Windows runners MUST be gated behind branch or path filters so they only run when the relevant code changes. Unfiltered expensive runners are forbidden.

**Compliant:**
```yaml
on:
  pull_request:
    paths:
      - 'src/windows/**'
jobs:
  windows-test:
    runs-on: windows-latest
```

### CD-003: Profile Before Upgrading
Before moving a job to a larger runner, the job MUST be profiled on the current runner to confirm that parallelism within a single job is the bottleneck, not I/O or external service latency.

## Caching

### CD-004: Use setup-* Built-in Caching
The `setup-node`, `setup-python`, `setup-java`, `setup-gradle`, `setup-ivy`, and `setup-ruby` actions cache their package manager stores by default. Adding a manual `actions/cache` step for the same dependency store is forbidden.

**Compliant:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

**Non-compliant:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- uses: actions/cache@v4
  with:
    path: node_modules
    key: node-${{ hashFiles('package-lock.json') }}
```

### CD-005: Cache Key Discipline
Custom `actions/cache` keys MUST include the lockfile hash (so the cache busts when dependencies change) AND a fallback `restore-keys` entry (so a partial match still provides a warm start).

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.gradle/caches
    key: gradle-${{ runner.os }}-${{ hashFiles('**/*.gradle') }}
    restore-keys: |
      gradle-${{ runner.os }}-
```

### CD-006: Cache Build Outputs Across Jobs
Compiled artifacts produced by a build job MUST be uploaded and downloaded by dependent jobs instead of rebuilt. Rebuilding in every dependent job is forbidden.

## Parallelism

### CD-007: No Spurious Dependencies
A job MUST only declare `needs:` for jobs whose outputs or artifacts it actually consumes. Jobs that are independent MUST run in parallel. Serial chains of unrelated jobs are forbidden.

**Compliant:**
```yaml
lint:
  runs-on: ubuntu-slim
unit-test:
  runs-on: ubuntu-latest
  needs: lint
integration-test:
  runs-on: ubuntu-latest
  needs: lint
```

**Non-compliant:**
```yaml
lint:
  runs-on: ubuntu-slim
unit-test:
  runs-on: ubuntu-latest
  needs: lint
integration-test:
  runs-on: ubuntu-latest
  needs: unit-test  # does not consume unit-test output
```

### CD-008: Fail Fast on PRs
Matrix strategies on pull request workflows MUST use `strategy.fail-fast: true` (the default) so that in-flight legs are cancelled when one fails. `fail-fast: false` on a PR CI matrix is forbidden unless there is a documented reason to collect the full picture.

### CD-009: Exclude Redundant Matrix Combinations
Matrix strategies MUST use `exclude` to remove combinations that are redundant (e.g., an OS × version cross-product where the code is OS-agnostic). Running redundant legs is forbidden.

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    java: [17, 21]
    exclude:
      - os: windows-latest
        java: 17
```

### CD-010: Order by Likelihood of Failure
In a dependency chain, the job most likely to fail quickly MUST run first so that expensive downstream jobs are skipped. Cheapest, most-likely-to-fail tests belong at the front of the chain.

## Trigger Filtering

### CD-011: Path Filters on Code Workflows
Workflows that build or test code MUST use `paths` or `paths-ignore` filters so that changes to unrelated files (docs, config, CI files only) do not trigger the workflow. Unfiltered code workflows are non-compliant.

```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'pom.xml'
```

### CD-012: Branch Filters on Expensive Workflows
Deploy, e2e, and cross-platform workflows MUST restrict execution to the branches that matter (e.g., `main`, `releases/**`) via `branches` filters.

### CD-013: Prefer paths Include Over paths-ignore
`paths` (include) MUST be preferred over `paths-ignore` (exclude) because `paths-ignore` triggers the workflow when *any* changed file does not match the ignore list, making it harder to reason about.

### CD-014: Manual Trigger for Expensive Workflows
Workflows that are expensive to run (full e2e, performance benchmarks, cross-platform compatibility) MUST also expose a `workflow_dispatch` trigger so teams can run them on demand without waiting for an automated trigger.

## Concurrency

### CD-015: Cancel Stale Runs
Every workflow MUST define a `concurrency.group` that is unique per workflow + ref, with `cancel-in-progress: true`, so that a new push cancels the in-flight run for the same ref.

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### CD-016: No Cancellation for Deploys
Deployment workflows MUST use `cancel-in-progress: false` (or omit the concurrency block) so that a new push does not cancel an in-flight deploy.

## Reuse

### CD-017: Extract Repeated Setup into Composite Actions
When the same dependency-install + build sequence appears in more than two jobs, it MUST be extracted into a composite action under `.github/actions/`. Copy-pasted setup blocks are forbidden.

### CD-018: Pin Reusable Workflow Refs
Reusable workflows (`uses:`) MUST be pinned to a tag or branch, never to `@main`. Unpinned refs are a supply chain risk and a source of silent breakage.

### CD-019: DRY via Reusable Workflows for Cross-Repo Sharing
When the same set of jobs is needed in multiple repositories, it MUST be extracted into a reusable workflow in a shared repository. Per-repo copies are forbidden.

## Step Hygiene

### CD-020: Use setup-* Actions Over Manual Installs
Tool installation MUST use the corresponding `setup-*` action (which handles caching and version pinning). Manual installation via `run:` is forbidden unless no setup action exists for the tool.

### CD-021: Pin Tool Versions and Use Lockfile Installs
Package installs MUST use lockfile-pinned commands (`npm ci`, `pip install -r requirements.txt`, `mvn -B`) instead of resolver-based commands (`npm install`, `pip install <pkg>`). Unpinned installs are non-compliant.

### CD-022: No continue-on-error on Build Steps
Build and test steps MUST NOT use `continue-on-error: true`. It hides failures and wastes runner-minutes on downstream steps that run against broken output.

### CD-023: Set timeout-minutes on Every Job
Every job MUST set an explicit `timeout-minutes`. The default 360-minute timeout is non-compliant. Reasonable values: 5 for lint, 15–30 for tests, 10 for deploy.

### CD-024: Combine Related Steps
Related shell commands MUST be grouped into a single `run:` block (using `&&` or a script file) rather than separate step entries. Each step has shell startup and environment-loading overhead.

## Test Execution

### CD-025: Run Only Affected Tests
Where the build tool supports it, test jobs MUST filter to changed tests (Gradle `--tests`, Maven `-Dtest=`, pytest `--lf`) rather than running the full suite on every change. Full-suite runs on every change are non-compliant for large suites.

### CD-026: Split Test Suites by Type
Unit tests, integration tests, and e2e tests MUST run in separate jobs (in parallel where independent) so that a slow integration suite does not block unit test feedback.

## Artifacts

### CD-027: Upload Only What Downstream Needs
`actions/upload-artifact` MUST upload only the specific files or directories that downstream jobs consume. Uploading the full build directory is forbidden.

### CD-028: Set retention-days Explicitly
Every `actions/upload-artifact` MUST set `retention-days` to the minimum needed (1–7 days). The default 90-day retention is non-compliant.

### CD-029: Debug Artifacts Only on Failure
Test reports, core dumps, and other debug output MUST be uploaded with `if: failure()` so that successful runs do not upload debug artifacts.

### CD-030: No Artifacts as a Registry Substitute
Built images (Docker, container) MUST be pushed to a registry and pulled in the deploy job. Uploading images as workflow artifacts is forbidden.

## Security

### CD-031: Pin Action Versions
All actions MUST be pinned to a full SHA (third-party) or major tag (first-party `actions/*`). Using `@main` or an unpinned ref for any action is forbidden.

### CD-032: Least-privilege GITHUB_TOKEN
Every workflow MUST set a `permissions:` block at the workflow or job level granting the minimum required access. Relying on the default `contents: write` token is non-compliant.

```yaml
permissions:
  contents: read
```

### CD-033: No pull_request_target with Write Token on Untrusted Code
The `pull_request_target` event MUST NOT be used with `GITHUB_TOKEN` write access to run code from untrusted forks. This is a well-known privilege escalation vector. Use `pull_request` for CI on forks; use `pull_request_target` only for trusted read-only operations (e.g., PR comments).

### CD-034: Environment Secrets for Deploy Credentials
Deployment credentials MUST be stored as environment secrets, not workflow-level secrets, so they are only available to the deploy job after any configured protection rules pass.

### CD-035: Never Print Secrets
Secret values MUST NOT be printed to logs. Use the `secrets` context and masking. Echoing or logging a secret value is forbidden.
