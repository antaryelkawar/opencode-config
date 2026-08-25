---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# State Management

Explicit state machines, idempotency, and concurrency-safe transitions for production systems.

## ST-001: Explicit state machines for multi-state entities
Any entity with three or more meaningful lifecycle states MUST be modeled as an explicit state machine: named states, named events, declared transitions. Ad-hoc combinations of boolean flags that encode state are a violation.
**Anti-pattern:** `Invoice { boolean sent; boolean paid; boolean voided; }`.

## ST-002: Transitions only through defined methods
State MUST change only through declared transition methods (e.g., `invoice.pay()`); direct mutation of the state field from outside the state machine MUST be forbidden.
**Anti-pattern:** a controller executing `invoice.status = "PAID"` after its own ad-hoc checks.

## ST-003: Guarded transitions, explicit rejection
Every transition MUST be guarded by explicit preconditions; an invalid transition MUST be rejected with a clear error (e.g., 409 / `INVALID_STATE_TRANSITION`), MUST NOT be silently ignored.
**Anti-pattern:** `pay()` called on an already-paid invoice silently "succeeding".

## ST-004: Terminal states are terminal
A state machine MUST define explicit terminal/final states, and transitions out of terminal states MUST be impossible.
**Anti-pattern:** `COMPLETED` orders that can be `cancelled()` and re-opened.

## ST-005: Idempotent operations
Any operation that can be retried (network calls, message consumption, scheduled jobs) MUST be idempotent: repeated application with the same inputs MUST have the same effect as a single application.
**Anti-pattern:** a webhook handler that increments a counter on every delivery.

## ST-006: Idempotency keys for non-idempotent operations
Mutating endpoints that are not inherently idempotent MUST accept a client-generated idempotency key; the server MUST store the result and return the stored result (not re-execute) when the same key is resubmitted; keys MUST be client-generated, MUST NOT contain sensitive data, MUST have a documented retention period.
**Anti-pattern:** no key support; a key derived from request content that changes whenever the payload changes.

## ST-007: Optimistic concurrency control
Concurrent updates to shared state MUST be guarded by a version/ETag: an update MUST fail with a conflict (409) if the state changed since the client read it; HTTP APIs MUST honor `If-Match`/`If-None-Match` and return `ETag`. MUST NOT blindly overwrite a record last written by someone else.
**Anti-pattern:** read-modify-write with no version check — lost updates under races.

## ST-008: No check-then-act races (atomic transitions)
Check-then-act sequences (read state, decide, write) MUST be atomic — a single transaction, a conditional write, or a CAS — otherwise the design MUST explicitly account for the TOCTOU hazard.
**Anti-pattern:** two workers both read `state=NEW`, both write `state=PROCESSING`, both run the handler.

## ST-009: Domain events for state changes
State changes that other parts of the system care about MUST be published as domain events (immutable, past-tense); event data MUST capture enough to reconstruct the effect; consumers MUST handle events idempotently.
**Anti-pattern:** the payment service polling the orders table for state changes.

## ST-010: Sagas for multi-step, multi-service state transitions
Long-running state transitions spanning multiple services MUST be implemented as sagas: a sequence of local transactions, each with a defined compensating transaction; saga steps MUST be idempotent; saga progress MUST be persisted so it can resume after a crash.
**Anti-pattern:** 2PC across services; a saga whose steps re-run non-idempotently after a restart.

## ST-011: Persist state with the entity, version it, audit transitions
The machine's current state MUST be persisted as part of the entity (with its version/ETag); in-flight workflow state MUST be recoverable after a process restart; state transitions MUST be auditable.
**Anti-pattern:** workflow state held only in process memory; no trail of which transition moved an order to `SHIPPED`.

## Sources
FSM theory; Gamma et al., *Design Patterns* (1995) — State; Hohpe & Woolf, *EIP* (2003) — Idempotent Receiver; Kung & Robinson (1981) — OCC; Richardson, "Saga pattern" (microservices.io); Stripe idempotent requests.
