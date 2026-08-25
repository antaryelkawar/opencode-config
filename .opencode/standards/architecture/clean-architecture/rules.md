---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# Clean / Hexagonal Architecture

Two formulations of the same core idea: Uncle Bob's Clean Architecture (concentric circles + Dependency Rule) and Cockburn's Hexagonal / Ports & Adapters. Both enforce the same boundary discipline.

## ARC-001: The Dependency Rule — dependencies point inward only
Source-code dependencies MUST point only inward. Code in an inner layer MUST NOT reference any name declared in an outer layer. A domain package MUST NOT import application/adapter/framework packages (enforce with ArchUnit or equivalent).
**Anti-pattern:** a domain entity annotated with ORM types; a use case importing `HttpServletRequest`.

## ARC-002: Layers separated by change velocity
The architecture MUST separate enterprise-wide business rules (entities) from application-specific use cases from interface adapters from frameworks/drivers; the innermost layer MUST NOT be affected by changes in UI, database, or external services.
**Anti-pattern:** business rules hard-coded to a database dialect or a UI flow.

## ARC-003: Ports defined by the inner side; adapters implement them
When control flow crosses a boundary, the inner layer MUST declare the port (interface) and the outer layer MUST implement the adapter. Dependency direction MUST oppose control-flow direction, resolved via dependency inversion.
**Anti-pattern:** a use case calling `WebFramework.render()` directly.

## ARC-004: Data crossing boundaries is a simple DTO
Data crossing a layer boundary MUST be a simple, isolated data structure in the form most convenient for the inner circle. Framework data formats (ORM rows, HTTP request/response objects) MUST NOT leak inward.
**Anti-pattern:** passing a JPA entity into a use case; domain objects carrying `@JsonProperty`.

## ARC-005: The core runs and tests without infrastructure
The application core MUST run and be testable without a database, UI, web server, or network: every external dependency MUST be replaceable by an in-memory mock/fake adapter.
**Anti-pattern:** unit tests that spin up Docker containers; domain tests that fail when the DB is down.

## ARC-006: Adapters are swappable per port
Each port MUST have at least one alternative adapter (mock/test or second technology) proving the port is technology-agnostic; adapters MUST convert between the port's protocol and the external technology without changing application logic.
**Anti-pattern:** SQL-specific queries embedded in application code with no adapter seam.

## ARC-007: Details live in the outermost layer
All concrete detail (SQL, HTTP handling, framework configuration) MUST live in the outermost layer; inner layers MUST contain only policy and abstraction. The outermost layer SHOULD consist mostly of glue code.
**Anti-pattern:** SQL strings inside use cases; request parsing inside entities.

## ARC-008: Use cases specified at the application boundary
Use cases MUST be specified and coded at the application boundary, independent of external technology; a use case MUST NOT contain intimate knowledge of UI widgets, form fields, or DB specifics.
**Anti-pattern:** a use case referencing form field IDs or column names.

## ARC-009: Port count is flexible; the separation is not
The number of ports is a design decision (2–4 typical), but the dependency rule and inside/outside separation MUST hold in all cases.
**Anti-pattern:** adding a "temporary" shortcut where the core imports a framework class "for now".

## Sources
R.C. Martin, "The Clean Architecture" (2012); *Clean Architecture* (2017); A. Cockburn, "Hexagonal Architecture" (2005).
