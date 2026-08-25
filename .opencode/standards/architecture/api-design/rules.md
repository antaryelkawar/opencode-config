---
scope: language-agnostic
audience: reviewer (design), architect, designer
---

# API Design

Prescriptive API design rules drawn from the Google AIPs and Microsoft Azure REST API Guidelines, plus RFC 7807/9457 for error format.

## API-001: Resource-oriented design with nouns
API resources MUST be modeled as nouns with hierarchical resource names; collection segments MUST be plural nouns; paths MUST NOT contain verbs (except documented action endpoints).
**Anti-pattern:** `/api/getOrders`, `/api/deleteUser/123`.

## API-002: Consistent, predictable identifiers
Resource IDs MUST be strings (no tuples, no self-links); IDs MUST use only URL-safe characters; resources MUST expose a stable `name`/`id` field clients can store.
**Anti-pattern:** numeric IDs that differ between environments; a `self_link` field clients must parse.

## API-003: Reference resources by name, never embed them
A resource referencing another MUST reference it by name/ID, not by embedding the full object; embedding complicates lifecycles, bypasses per-resource permissions, and tightly couples schemas.
**Anti-pattern:** `Order.customer: {full customer JSON}` duplicated into every order.

## API-004: Correct HTTP method semantics
GET MUST be safe and cacheable; POST for creation and actions; PUT for full replace; PATCH for partial update; DELETE for deletion; the same kind of operation MUST consistently use the same method.
**Anti-pattern:** a GET that fires notifications; `POST /users/123` for updates.

## API-005: Create returns 201 with the created resource
Create operations MUST return 201 Created containing the created resource (or its canonical name/URL); the response MUST let the client locate the new resource.
**Anti-pattern:** create returning 200 with `{"success": true}` and no way to retrieve the new resource.

## API-006: Idempotent create / idempotency keys
Mutating (especially create) operations MUST be safe to retry: either inherently idempotent (client-specified ID), or the API MUST accept a client-provided idempotency key; a repeated request with the same key MUST return the original result without re-executing.
**Anti-pattern:** `POST /orders` silently creating a second order when the client retries after a timeout.

## API-007: Pagination from day one
Every collection-list endpoint MUST support pagination at design time; use `page_size` (optional, documented default and maximum) plus opaque `page_token`/`next_page_token`; an empty next token MUST be the only end-of-collection signal; tokens MUST be opaque and MUST NOT grant authorization.
**Anti-pattern:** `GET /users` returning the whole table; a parseable page token; adding pagination to an existing endpoint.

## API-008: Versioning strategy
APIs MUST expose a major version in the URI path (`/v1/…`); MUST NOT expose minor/patch numbers in the URL; a new major version MUST NOT depend on the previous major version; functionality MUST be deprecated (documented transition period, ≥180 days for stable removals) before removal.
**Anti-pattern:** `/v1.2.3/` in the URL; removing an endpoint in v2 with no deprecation period.

## API-009: Standardized, machine-readable errors
Errors MUST use a standard structured format (RFC 7807/9457 `application/problem+json` or equivalent with a stable error code); every error MUST carry a machine-readable, stable code in addition to a human-readable message; clients MUST NOT need to parse message text to branch on errors.
**Anti-pattern:** `{"error": "Something went wrong"}` with no code.

## API-010: Correct and complete status codes
Responses MUST use the semantically correct HTTP status code (400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 semantic validation failure, 429 rate limited, 5xx server fault); MUST NOT return 200 with an error body for failures.
**Anti-pattern:** 200 + `{"error": …}`; 404 on permission problems that reveal which user IDs exist.

## API-011: Error messages — actionable, no internal leaks
Error messages MUST be actionable and MUST NOT expose implementation internals (stack traces, SQL, internal hostnames); request-specific dynamic values MUST be in structured fields, not only embedded in message text.
**Anti-pattern:** `detail: "java.sql.SQLException: connection refused at PgPool.java:42"`.

## API-012: Long-running operations
Operations that cannot complete in a reasonable request/response window MUST return immediately with an Operation/Job resource (200/202) that clients can poll; MUST NOT block the connection for long durations.
**Anti-pattern:** `POST /reports` holding the HTTP connection open for four minutes.

## API-013: Field naming and documentation
Field names MUST follow one consistent convention (chosen and documented); reserved words MUST be used only for their designated API purpose; every field MUST document units, allowed ranges, defaults, and string constraints; enum-like fields SHOULD be extensible unless the value set can never change.
**Anti-pattern:** `amount` with no unit; `userId` in one endpoint and `user_id` in another.

## API-014: GET never returns secrets
GET responses MUST NOT include secret fields (passwords, tokens, private keys); secrets MAY be returned only on the specific POST that created them, and only when strictly necessary.
**Anti-pattern:** `GET /users/123` returning `administratorPassword`.

## Sources
Google AIPs (google.aip.dev: 122, 133, 155, 158, 185, 192, 193); Microsoft Azure REST API Guidelines (2025-03-28); RFC 7807 / RFC 9457.
