---
scope: Java
tooling_deferral: true
override_precedence: project-local
---

# Java Concurrency Rules

### JAVA-CON-001: Thread Creation
Do not create threads directly with `new Thread()`. Use `ExecutorService` or `CompletableFuture`.

**Compliant:** `executorService.submit(() -> task())`
**Forbidden:** `new Thread(() -> task()).start()`

### JAVA-CON-002: Thread Pool Sizing
Thread pools MUST have explicit core and max pool sizes. Unbounded thread pools are forbidden.

### JAVA-CON-003: Synchronization Scope
Synchronized blocks MUST be as small as possible. Never synchronize entire methods unless justified. Avoid synchronizing on `this` — use private final lock objects.

**Compliant:**
```
private final Object lock = new Object();
synchronized (lock) { ... }
```

**Forbidden:** `synchronized (this) { ... }`

### JAVA-CON-004: Volatile Usage
Use `volatile` for visibility of shared primitive variables. For compound operations (increment, check-then-act), use `AtomicInteger` or synchronization.

### JAVA-CON-005: Concurrent Collections
Use `ConcurrentHashMap`, `CopyOnWriteArrayList`, etc., for concurrent access. Do not wrap `HashMap` with `Collections.synchronizedMap()` in new code.

### JAVA-CON-006: Lock Ordering
When acquiring multiple locks, always acquire them in a consistent global order to prevent deadlocks. Document the lock order.

### JAVA-CON-007: CompletableFuture Usage
Prefer `CompletableFuture` over raw threads for async operations. Always handle exceptions with `.exceptionally()` or `.handle()`.

### JAVA-CON-008: Immutable Objects
Favor immutable objects for thread safety. If a class is immutable, document it. Use `final` for fields that should not change.
