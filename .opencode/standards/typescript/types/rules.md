---
scope: TypeScript
tooling_deferral: true
override_precedence: project-local
---

# TypeScript Type Safety Rules

### TS-TYPE-001: Strict Mode Required
`tsconfig.json` MUST enable `strict: true`. This includes `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and `noImplicitThis`.

### TS-TYPE-002: No `any`
The `any` type is forbidden. Use `unknown` when the type is genuinely unknown, then narrow it.

**Compliant:** `const data: unknown = parse(input)`
**Forbidden:** `const data: any = parse(input)`

### TS-TYPE-003: No `as` Type Assertions
Type assertions (`as`) are forbidden except in test files. Prefer type guards, narrowing, or `satisfies`.

**Compliant:** `if (isUser(data)) { data.name }`
**Forbidden:** `(data as User).name`

### TS-TYPE-004: Discriminated Unions
Use discriminated unions instead of optional fields for variant types. The discriminant field MUST be a literal type.

**Compliant:**
```
type Result =
  | { status: "success"; data: User }
  | { status: "error"; message: string };
```

**Forbidden:** `type Result = { data?: User; message?: string }`

### TS-TYPE-005: No Non-null Assertion
The `!` operator is forbidden. Handle nullability explicitly with checks, optional chaining (`?.`), or nullish coalescing (`??`).

**Forbidden:** `user!.name`

### TS-TYPE-006: Return Types on Public Functions
All exported functions MUST have explicit return type annotations. Internal functions MAY use inference.

**Compliant:** `export function getUser(id: string): Promise<User>`
**Forbidden:** `export async function getUser(id: string) { ... }`

### TS-TYPE-007: Readonly by Default
Properties that are not reassigned MUST be marked `readonly`. Arrays and objects passed as read-only MUST use `Readonly<T>` or `readonly T[]`.

### TS-TYPE-008: Index Signatures Forbidden
Index signatures (`[key: string]: any`) are forbidden. Use `Record<K, V>` or `Map<K, V>` with known key types.
