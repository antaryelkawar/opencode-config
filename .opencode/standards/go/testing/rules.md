---
scope: Go
tooling_deferral: true
override_precedence: project-local
---

# Go Testing Rules

### GO-TEST-001: Table-Driven Tests
Tests MUST use table-driven patterns with a slice of test cases. Each case MUST have a descriptive name.

**Compliant:**
```
tests := []struct{
    name     string
    input    int
    expected int
}{
    {"positive", 5, 25},
    {"zero", 0, 0},
    {"negative", -3, 9},
}
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) { ... })
}
```

### GO-TEST-002: Test File Naming
Test files MUST be named `<package>_test.go` and live in the same directory as the code they test.

### GO-TEST-003: Test Function Naming
Test functions MUST follow the pattern `Test<FunctionName>_<Scenario>` using camelCase after `Test`.

**Compliant:** `TestParseConfig_ValidInput`, `TestParseConfig_MissingField`
**Forbidden:** `testParseConfig`, `Test_parseConfig`

### GO-TEST-004: Test Helper Functions
Helper functions called from tests MUST call `t.Helper()` to ensure test failures report the correct line number.

### GO-TEST-005: Benchmark Functions
Benchmarks MUST follow the pattern `Benchmark<FunctionName>` and use `b.N` for iteration count.

### GO-TEST-006: Test Coverage
All exported functions MUST have at least one test. Critical paths MUST have >80% coverage.

### GO-TEST-007: Test Isolation
Tests MUST NOT depend on global state, environment variables, or file system state that persists between runs. Use `t.TempDir()` for temporary files.

### GO-TEST-008: Mock Generation
Mocks MUST be generated using `mockgen` or similar tools. Hand-written mocks are forbidden unless explicitly justified.
