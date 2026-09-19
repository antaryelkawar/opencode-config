# Code Standards Index

This index catalogs all coding, design, review, and agentic standards. Read the relevant file(s) before writing or reviewing code or artifacts in that language/topic. Each file uses a prefix-based rule ID system (e.g., `GC-001`, `JAVA-NAME-001`, `TS-ASYNC-001`, `SOL-001`, `CRIT-S-01`, `LPM-001`) for precise reference.

## General

Language-agnostic principles applicable to all code.

| File | Description |
|---|---|
| `general/clean-code/rules.md` | Clean code: structure, modularity, naming, comments (GC-*) |
| `general/testing/rules.md` | Test design, structure, coverage, mocking (GT-*) |
| `ci-cd/rules.md` | GitHub Actions pipelines: cost & time optimization (CD-*) |

## Java

| File | Description |
|---|---|
| `java/naming/rules.md` | Class, method, variable, constant, package naming (JAVA-NAME-*) |
| `java/oop/rules.md` | Encapsulation, composition, injection, final-by-default (JAVA-OOP-*) |
| `java/error-handling/rules.md` | Exception types, messages, catch blocks, chaining (JAVA-ERR-*) |
| `java/concurrency/rules.md` | Thread pools, synchronization, volatile, CompletableFuture (JAVA-CON-*) |
| `java/testing/rules.md` | Test naming, AAA, AssertJ, Mockito, data builders (JAVA-TEST-*) |

## Go

| File | Description |
|---|---|
| `go/naming/rules.md` | Exported/unexported naming conventions (GO-NAME-*) |
| `go/packages/rules.md` | Package structure and organization (GO-PKG-*) |
| `go/error-handling/rules.md` | Error returns, wrapping, sentinel errors (GO-ERR-*) |
| `go/concurrency/rules.md` | Goroutines, channels, context, sync primitives (GO-CON-*) |
| `go/testing/rules.md` | Table-driven tests, test helpers, coverage (GO-TEST-*) |

## TypeScript

| File | Description |
|---|---|
| `typescript/naming/rules.md` | Variable, function, type, enum naming (TS-NAME-*) |
| `typescript/types/rules.md` | Type safety, any prohibition, generics, interfaces (TS-TYPE-*) |
| `typescript/async/rules.md` | Promises, async/await, error handling (TS-ASYNC-*) |
| `typescript/testing/rules.md` | Test structure, mocking, type-safe tests (TS-TEST-*) |

## Architecture & Design

Language-agnostic architecture and design rules. Load these when reviewing or authoring design documents, specs, or when making structural decisions.

| File | Description |
|---|---|
| `architecture/solid/rules.md` | SOLID principles + composition, no feature enablers (SOL-*) |
| `architecture/clean-architecture/rules.md` | Dependency rule, ports/adapters, layer separation (ARC-*) |
| `architecture/ddd/rules.md` | Bounded contexts, aggregates, events, repositories (DDD-*) |
| `architecture/api-design/rules.md` | REST conventions, versioning, pagination, errors (API-*) |
| `architecture/modules/rules.md` | Cohesion, coupling, Law of Demeter, no god packages (MOD-*) |
| `architecture/state/rules.md` | State machines, idempotency, concurrency control, sagas (ST-*) |

## Review Criteria

Checklists the reviewer agent applies per artifact type. Severity: **critical** blocks, **major** should fix, **minor** suggest, **observation** note.

| File | Description |
|---|---|
| `review/spec-review/rules.md` | Spec review criteria (CRIT-S-*) |
| `review/design-review/rules.md` | Design review criteria (CRIT-D-*) |
| `review/task-review/rules.md` | Task review criteria (CRIT-T-*) |

## Agentic / Loop Engineering

Rules for AI-driven coding loops: token efficiency, loop convergence, agentic authoring/reviewing, spec quality for AI consumption, context management, and failure-mode detection. Load per role — not all files for every agent.

| File | Description | Loaded by |
|---|---|---|
| `agentic/token-efficiency/rules.md` | Instruction/tool/delegation token discipline (TKN-*) | all agents |
| `agentic/loop-engineering/rules.md` | Generate→review→fix convergence (LPM-*) | orchestrator, impl-worker, reviewer |
| `agentic/agentic-coding/rules.md` | AI as author/reviewer patterns (AGC-*) | impl-worker, code-reviewer, reviewer |
| `agentic/spec-quality/rules.md` | Specs AI can implement without drift (SPX-*) | architect, designer, reviewer |
| `agentic/ai-code-review/rules.md` | Reviewing AI-generated code (RCR-*) | code-reviewer, reviewer |
| `agentic/context-management/rules.md` | Artifact structure & handoff (CTX-*) | all agents |
| `agentic/failure-modes/rules.md` | Loop failure taxonomy — detection + prevention (FM-*) | debugger, reviewer, orchestrator |

## Usage

Before writing or reviewing code:
1. Read `general/clean-code/rules.md` (applies to all languages).
2. Read the language-specific file(s) for the code you're touching.
3. For design reviews: read the relevant `architecture/` files + `review/design-review/rules.md`.
4. For spec reviews: read `review/spec-review/rules.md` + `agentic/spec-quality/rules.md`.
5. For code reviews: read `agentic/ai-code-review/rules.md` + the language files + `review/` criteria as applicable.
6. Reference rules by ID in reviews and comments (e.g., "violates JAVA-NAME-002", "CRIT-S-03", "RCR-004").

All rules are prefixed for quick lookup. Project-local overrides may exist — check the project's AGENTS.md or CONTRIBUTING.md for language-specific conventions.
