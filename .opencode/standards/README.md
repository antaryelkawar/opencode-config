# Code Standards Index

This index catalogs all coding standards. Read the relevant file(s) before writing or reviewing code in that language/topic. Each file uses a prefix-based rule ID system (e.g., `GC-001`, `JAVA-NAME-001`, `TS-ASYNC-001`) for precise reference.

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

## Usage

Before writing or reviewing code:
1. Read `general/clean-code/rules.md` (applies to all languages).
2. Read the language-specific file(s) for the code you're touching.
3. Reference rules by ID in reviews and comments (e.g., "violates JAVA-NAME-002").

All rules are prefixed for quick lookup. Project-local overrides may exist — check the project's AGENTS.md or CONTRIBUTING.md for language-specific conventions.
