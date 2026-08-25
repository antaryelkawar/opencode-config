---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# Module / Package Design

Cohesion, coupling, and boundary discipline at the package/module level.

## MOD-001: Functional cohesion
A module MUST contain parts that contribute to one well-defined responsibility; MUST NOT group code merely because it runs at the same time (temporal), in a fixed sequence (procedural), or because it is "miscellaneous" (coincidental).
**Anti-pattern:** a `Utils` class with `parseDate()`, `sendEmail()`, and `computeTax()`.

## MOD-002: Minimize coupling type
Modules SHOULD couple through narrow, stable interfaces passing only the data they need (data coupling); MUST avoid content coupling (reaching into another module's internals) and global coupling (shared mutable state).
**Anti-pattern:** `OrderModule` reading `InventoryModule.stockTable` directly.

## MOD-003: Law of Demeter
A method MUST only call methods on: (1) itself, (2) its direct parameters, (3) objects it creates locally, (4) its direct components/fields. It MUST NOT call a method on an object returned by another method (no chained `a.b().c().d()`).
**Anti-pattern:** `order.getCustomer().getAddress().getCity().getRegion()`.

## MOD-004: No circular dependencies
Packages/modules MUST NOT import each other cyclically; when a cycle is detected, extract the shared abstraction into a third module. Enforce with build tools (ArchUnit, dependency-cruiser, or language-level lints).
**Anti-pattern:** `auth` importing `users` while `users` imports `auth`.

## MOD-005: Stable Dependencies — general does not depend on specific
General (stable, broadly reusable) modules MUST NOT depend on specialized (unstable, narrow) modules; dependencies MUST point from specific to general.
**Anti-pattern:** a shared `core` library importing an app-specific `billing` package.

## MOD-006: One reason to change per package
A package MUST be organized around a single reason for change (SRP at the module level); code that changes for different reasons MUST live in different packages.
**Anti-pattern:** a `compliance` package containing both PCI logging and GDPR export.

## MOD-007: Minimal public API
A module's public surface MUST expose only what its callers need; implementation details MUST be kept internal; any growth of the public surface MUST be a deliberate decision, because public APIs carry backwards-compatibility obligations.
**Anti-pattern:** everything public "in case it's useful".

## MOD-008: Interface segregation at module boundaries
A package's exported interface SHOULD be split so each client depends only on the parts it uses; a wide interface where typical consumers need a subset SHOULD be split into role-specific interfaces.
**Anti-pattern:** `DataAccess` exposing `query()`, `migrate()`, `backup()`, `exportCsv()` where 90% of consumers only need `query()`.

## MOD-009: Tell, Don't Ask across module boundaries
When a module needs to compute something from another module's data that belongs to that data, it MUST call a behavior exposed by the owning module rather than extracting raw data and re-implementing the logic.
**Anti-pattern:** the billing module extracting order line items and re-implementing tax calculation.

## MOD-010: No god packages
Catch-all packages (`common`, `utils`, `helpers`, `misc`) MUST NOT be used as dumping grounds; every module MUST have a name that reflects a domain responsibility.
**Anti-pattern:** `utils` growing to 40 files over three years and being imported by everything.

## Sources
Stevens/Myers/Constantine (1974); Yourdon & Constantine (1979); Lieberherr & Holland (1989); R.C. Martin, *Clean Architecture* (2017); M. Fowler, "Tell-Don't-Ask" (2013).
