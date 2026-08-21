---
scope: TypeScript
tooling_deferral: true
override_precedence: project-local
---

# TypeScript Testing Rules

### TS-TEST-001: Test File Co-location
Test files MUST be named `<file>.test.ts` and live adjacent to the source file.

**Compliant:** `src/utils/parse.ts` → `src/utils/parse.test.ts`
**Forbidden:** `tests/utils/parse.test.ts` (unless monorepo convention differs)

### TS-TEST-002: Test Framework
Use Vitest or Jest. Config MUST be in `vitest.config.ts` or `jest.config.ts` at project root.

### TS-TEST-003: Test Naming Convention
Test descriptions MUST follow: `it("should <expected> when <condition>")` pattern.

**Compliant:** `it("should return user when valid id provided")`
**Forbidden:** `it("works")`, `it("test 1")`

### TS-TEST-004: Arrange-Act-Assert
Tests MUST separate setup, action, and assertion with blank lines or comments.

### TS-TEST-005: No Snapshot Tests for Logic
Snapshot tests (`toMatchSnapshot()`) are forbidden for business logic. Use explicit assertions. Snapshots are permitted only for serialized output validation (e.g., CSS, SVG).

### TS-TEST-006: Mock External Boundaries
Mock HTTP calls, database clients, and timers. Never mock internal utility functions.

**Compliant:** `vi.mock("../api/client")`
**Forbidden:** `vi.mock("../utils/formatDate")`

### TS-TEST-007: Type-safe Test Data
Test data MUST use factory functions that return properly typed objects. Inline object literals with missing required fields are forbidden.

**Compliant:**
```
function createUser(overrides?: Partial<User>): User {
  return { id: "1", name: "Test", email: "test@test.com", ...overrides };
}
```

### TS-TEST-008: No Test.skip in Main Branch
Tests marked with `skip` or `todo` MUST have an associated issue tracker reference.

**Compliant:** `it.skip("should handle edge case — see JIRA-123")`
