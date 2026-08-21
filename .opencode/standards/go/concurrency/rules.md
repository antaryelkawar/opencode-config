---
scope: Go
tooling_deferral: true
override_precedence: project-local
---

# Go Concurrency Rules

### GO-CON-001: Goroutine Lifecycle
Every goroutine MUST have a clear owner responsible for its termination. Unbounded goroutines are forbidden.

### GO-CON-002: Context Propagation
All goroutines MUST accept a `context.Context` as their first parameter. The context MUST be used for cancellation and timeout signaling.

### GO-CON-003: Channel Direction
Channels MUST be typed with explicit direction (`<-chan` for receive-only, `chan<-` for send-only) whenever possible to enforce intent at the type level.

### GO-CON-004: Channel Buffering
Unbuffered channels MUST be the default choice. Buffered channels MUST be justified with documented rationale.

### GO-CON-005: Select with Timeout
All `select` statements MUST include a `default` case or a `time.After` timeout to prevent indefinite blocking.

**Compliant:**
```
select {
case msg := <-ch:
    process(msg)
case <-time.After(5 * time.Second):
    return errors.New("timeout")
}
```

### GO-CON-006: Sync Primitive Selection
Use channels for communication between goroutines. Use `sync.Mutex` only for protecting shared state within a single goroutine or small critical sections.

### GO-CON-007: WaitGroup Usage
`sync.WaitGroup` MUST be passed by pointer. The `Add()` call MUST happen before the goroutine starts, not inside it.

**Compliant:**
```
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    // work
}()
wg.Wait()
```

### GO-CON-008: Race Condition Prevention
Code MUST be free of data races. Run `go test -race` in CI. Any detected race is a blocking issue.
