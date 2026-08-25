---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# Domain-Driven Design (practical subset)

The practical subset of DDD: strategic design (bounded contexts, ubiquitous language) and tactical design (aggregates, events, repositories, behavior colocation).

## DDD-001: Bounded contexts are mandatory at scale
A large domain MUST be partitioned into bounded contexts, each with a single internally consistent model; MUST NOT force one unified model across the whole organization.
**Anti-pattern:** one shared "Customer" class used by billing, support, and marketing where each means something different.

## DDD-002: Context boundaries follow language and team boundaries
Context boundaries MUST be drawn where the team's vocabulary changes (polysemes like "customer", "product", "order"); relationships between contexts MUST be explicit (a context map) with a defined integration mechanism.
**Anti-pattern:** two teams silently sharing a "Product" table while interpreting its fields differently.

## DDD-003: Ubiquitous language in code
Code (class, method, variable, test names) MUST use the domain experts' vocabulary; within a bounded context, one term MUST mean exactly one thing.
**Anti-pattern:** `DataManager2.getStuff()`; "Customer" meaning bill-to contact in one context and shipping recipient in another.

## DDD-004: Aggregates — invariants inside the boundary, small by default
An aggregate MUST encapsulate the invariants that must hold within a single consistency boundary; the aggregate root MUST be the only entry point for modifications; aggregates SHOULD be kept small.
**Anti-pattern:** an `Order` aggregate containing the full `Customer`, all `LineItems`, `Inventory`, and `Payment`, locked for the whole transaction.

## DDD-005: Reference other aggregates by ID
An aggregate MUST NOT hold direct object references to other aggregates; it MUST hold their identifiers and resolve them when needed.
**Anti-pattern:** `Order.customer` being a live in-memory `Customer` aggregate passed across service boundaries.

## DDD-006: Domain events are immutable facts
A domain event MUST be immutable once created; events MUST describe something that has already happened (past-tense naming: `OrderPlaced`); corrections MUST be modeled as new events, not by mutating the old one.
**Anti-pattern:** updating `OrderPlaced.amount` after a refund.

## DDD-007: Events carry explicit, unambiguous time
An event MUST record timestamps and MUST be explicit about whether it records when the event *occurred* or when it was *noticed* by the system.
**Anti-pattern:** `event.timestamp` that is sometimes transaction time and sometimes processing time.

## DDD-008: No anemic domain model
Domain logic MUST live on domain objects; the application/service layer MUST be thin — orchestrating use cases without business rules. If all behavior lives in services that merely read and write properties, the rule is violated.
**Anti-pattern:** `Customer` as a bag of getters/setters with `CustomerService.checkEligibility(customer)` holding every business rule.

## DDD-009: Repositories per aggregate root — not a query API
A repository MUST provide collection-like access to a single aggregate (one per aggregate root) and MUST hide the storage mechanism; complex reporting/search queries MUST NOT be crammed into repositories.
**Anti-pattern:** `OrderRepository.findOrdersByCustomerSinceWithTotals(customer, date)` returning joined DTOs.

## DDD-010: Behavior colocation (Tell, Don't Ask)
When a client needs data from object A in order to compute something that belongs to A, the client MUST call a behavior on A rather than extracting A's fields and re-implementing the logic.
**Anti-pattern:** `if (order.getCustomer().getRegion() == EU) applyVat(order)` instead of `order.applyVat()`.

## Sources
E. Evans, *Domain-Driven Design* (2003); V. Vernon, *Implementing DDD* (2013); M. Fowler bliki: BoundedContext, AnemicDomainModel, DomainEvent, Tell-Don't-Ask.
