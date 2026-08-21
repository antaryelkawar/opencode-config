---
scope: Go
tooling_deferral: true
override_precedence: project-local
---

# Go Package Organization Rules

### GO-PKG-001: Package Per Directory
Each directory MUST contain exactly one package. Multiple packages in a single directory are forbidden.

### GO-PKG-002: Package Cohesion
All files in a package MUST be tightly related. If a package exceeds 10 files or 2000 lines, it MUST be split.

### GO-PKG-003: Circular Dependency Prevention
Packages MUST NOT have circular imports. The dependency graph MUST be a DAG (directed acyclic graph).

### GO-PKG-004: Public API Minimization
Export only what is necessary. Default to unexported (lowercase) unless external consumption is required.

### GO-PKG-005: Internal Packages
Implementation details that MUST NOT be imported by other modules MUST live in an `internal/` directory.

### GO-PKG-006: Test Package Naming
Tests in the same package MUST use `package foo`. Tests that verify public API only MUST use `package foo_test` (black-box testing).

### GO-PKG-007: Main Package
Only `main.go` or the entry point executable MUST use `package main`. All other code MUST be organized into named packages.

### GO-PKG-008: Vendor Directory
The `vendor/` directory MUST NOT be committed to version control. Use `go mod` for dependency management.
