---
scope: TypeScript
tooling_deferral: true
override_precedence: project-local
---

# TypeScript Naming Rules

### TS-NAME-001: Interfaces vs Types
Use `interface` for object shapes that may be extended. Use `type` for unions, intersections, and complex types. Never use `type` for a plain object when `interface` works.

### TS-NAME-002: Interface Names
Interfaces MUST be PascalCase nouns. Do NOT prefix with `I`.

**Compliant:** `UserRepository`, `HttpClient`
**Forbidden:** `IUserRepository`, `IHttpClient`

### TS-NAME-003: Type Parameter Names
Type parameters MUST be single uppercase letters: `T`, `K`, `V`, `R`, `E`. For multiple parameters use descriptive PascalCase (`TResult`, `TError`).

### TS-NAME-004: Enum Alternative
Prefer union types over `enum`. If `enum` is used, names MUST be PascalCase; values MUST be PascalCase or SCREAMING_SNAKE_CASE.

**Preferred:** `type Status = "active" | "inactive" | "pending"`
**Forbidden:** `enum Status { Active, Inactive, Pending }` (unless numeric enum is required)

### TS-NAME-005: File Names
Component files MUST be PascalCase (`UserCard.tsx`). Utility and service files MUST be kebab-case (`http-client.ts`). Test files MUST end in `.test.ts` or `.spec.ts`.

### TS-NAME-006: Constants
Module-level constants MUST be SCREAMING_SNAKE_CASE or camelCase if the project convention prefers. Internal consistency within a file is required.

### TS-NAME-007: Boolean Variables
Boolean variables MUST read as predicates. Prefix with `is`, `has`, `can`, `should`, `was`.

**Compliant:** `isLoading`, `hasError`, `canSubmit`
**Forbidden:** `loading`, `error`, `submit`

### TS-NAME-008: Function Parameters
Parameters MUST use camelCase. Optional parameters MUST use `?` suffix, not `undefined` union.

**Compliant:** `function fetchUser(id: string, options?: FetchOptions)`
**Forbidden:** `function fetchUser(id: string, options: FetchOptions | undefined)`
