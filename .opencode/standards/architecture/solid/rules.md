---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# SOLID & Design Principles

Practical, enforceable interpretations of the SOLID principles plus closely-related design rules. Each rule states a checkable condition, an anti-pattern, and its source.

## SOL-001: Single Responsibility — one reason to change
A module (class) MUST have exactly one reason to change. If you cannot state the reason for change in one sentence without "and", the module violates SRP.
**Anti-pattern:** `UserService` that validates, persists, emails, and formats UI output.

## SOL-002: Open-Closed — extend without modifying
New behavior MUST be addable without editing existing code. An abstraction point (interface, strategy, handler registry) MUST exist so a new variant is a new implementation, not a new branch. A switch/if-else chain on type gaining one branch per new variant is a violation signal.
**Anti-pattern:** `exportDocument()` with `if (format == "pdf") … else if (format == "csv") …`.

## SOL-003: Liskov Substitution — substitutability
Subtypes MUST be substitutable for their base type without breaking client behavior: do not weaken documented postconditions, do not strengthen preconditions, do not throw new undeclared exception types. If a client must check `instanceof` to handle a subclass, substitution is broken.
**Anti-pattern:** `Square extends Rectangle` where width/height setters break area; `S3ObjectStore.copy()` throwing `UnsupportedOperationException`.

## SOL-004: Interface Segregation — no unused dependencies
Clients MUST NOT be forced to depend on methods they do not use. When an interface is wider than what a typical client consumes, or implementations stub no-op methods, split it into role-specific interfaces.
**Anti-pattern:** `Worker` interface with `compile()`, `print()`, `sendEmail()`, `deploy()` where each implementation stubs half.

## SOL-005: Dependency Inversion — depend on abstractions you own
High-level (policy) modules MUST NOT depend on low-level (detail) modules; both MUST depend on abstractions owned by the high-level side. Business logic MUST NOT `new` concrete infrastructure; dependencies MUST be injected so tests can substitute fakes.
**Anti-pattern:** `OrderService` calling `new PostgresConnection(...)` directly.

## SOL-006: Composition over inheritance
Reuse SHOULD be by composition (has-a, delegation); inheritance (is-a) MUST be reserved for genuine, stable generalization. Inheritance chains deeper than ~2 levels, or inheriting "for the methods", are violation signals.
**Anti-pattern:** `AbstractServiceBase` inherited by 20 unrelated services.

## SOL-007: No feature enablers
A method MUST NOT take a boolean/flag parameter that switches between two different behaviors; expose two separate methods instead.
**Anti-pattern:** `save(entity, bypassValidation)` — the flag signals two reasons for change in one method.

## Sources
R.C. Martin, "Design Principles and Design Patterns" (2000); *Clean Architecture* (2017); Liskov & Wing (1994); Gamma et al., *Design Patterns* (1995); *Clean Code* (2008).
