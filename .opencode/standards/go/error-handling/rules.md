---
scope: Go
tooling_deferral: true
override_precedence: project-local
---

# Go Error Handling Rules

### GO-ERR-001: Explicit Error Checking
Every function call that returns an error MUST be checked immediately. Ignoring errors with `_` is forbidden unless explicitly documented why.

**Compliant:**
```
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err)
}
```

**Forbidden:** `result, _ := doSomething()`

### GO-ERR-002: Error Wrapping
When returning an error from a called function, MUST wrap it with context using `fmt.Errorf("context: %w", err)`. Bare `return err` is forbidden.

### GO-ERR-003: Custom Error Types
Custom errors MUST implement the `error` interface and use `errors.Is()` and `errors.As()` for type checking. Direct type assertions on errors are forbidden.

### GO-ERR-004: Sentinel Errors
Sentinel errors MUST be declared as package-level variables using `var ErrNotFound = errors.New("not found")`. Use `errors.Is()` to check for sentinel errors.

### GO-ERR-005: Panic Prohibition
Production code MUST NOT use `panic()` for error handling. `panic` is reserved for unrecoverable programmer errors only (e.g., invariant violations).

### GO-ERR-006: Error Messages
Error messages MUST be lowercase, not end with punctuation, and describe what went wrong (not what should be done).

**Compliant:** `"user not found"`, `"invalid configuration"`
**Forbidden:** `"User Not Found!"`, `"Please check your configuration."`
