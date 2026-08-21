---
scope: language-agnostic
tooling_deferral: true
override_precedence: project-local
---

# General Testing Rules

## Test Design

### GT-001: Test Behavior, Not Implementation
Tests MUST verify observable outputs and side effects. Asserting on internal state, private methods, or implementation order is forbidden.

### GT-002: One Assertion per Concept
Each test MUST verify exactly one behavioral concept. Multiple unrelated assertions in a single test are forbidden — split into separate tests.

### GT-003: Test Independence
Tests MUST NOT depend on execution order, shared mutable state, or side effects from other tests. Each test MUST set up its own state and tear down after itself.

### GT-004: Deterministic Tests
Tests MUST produce the same result on every run. Flaky tests (timing-dependent, random-dependent, environment-dependent) MUST be fixed or removed immediately.

### GT-005: Test the Unhappy Path
For every public function, tests MUST cover at least one error/exception path. Happy-path-only test suites are non-compliant.

## Test Structure

### GT-006: Arrange-Act-Assert
All tests MUST follow the Arrange-Act-Assert pattern. Each phase MUST be clearly separated by a blank line or comment.

### GT-007: Test Naming
Test names MUST follow the format: `<MethodUnderTest>_<Scenario>_<ExpectedResult>`. Generic names like `testFunction1` are forbidden.

### GT-008: Test File Co-location
Test files MUST live adjacent to the source they test (same package/directory) or in a designated test root mirroring the source tree. Random placement is forbidden.

## Test Coverage

### GT-009: Critical Path Coverage
All critical business logic, payment flows, authentication paths, and data mutation endpoints MUST have dedicated tests.

### GT-010: Boundary Values
Tests MUST cover boundary conditions: empty collections, null/nil inputs, zero values, maximum values, and off-by-one edges.

### GT-011: Integration Test Requirement
Every system MUST have integration tests that verify cross-component communication. Unit-test-only coverage is non-compliant.

## Mocking

### GT-012: Mock External Boundaries Only
Mocks MUST wrap external dependencies (HTTP calls, database queries, file I/O, clock). Mocking internal logic is forbidden.

### GT-013: Mock Verification Limit
A test MUST NOT verify more interactions than necessary to confirm the behavior. Over-specifying mock expectations is forbidden.

## CI Enforcement

### GT-014: All Tests Must Pass in CI
No commit MAY be merged if any test fails in CI. Skipping or disabling failing tests without a tracked issue is forbidden.

### GT-015: Test Execution Time
The full unit test suite MUST complete in under 60 seconds. Tests exceeding this budget MUST be profiled and optimized or moved to an integration suite.
