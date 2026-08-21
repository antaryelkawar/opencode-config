---
scope: TypeScript
tooling_deferral: true
override_precedence: project-local
---

# TypeScript Async Rules

### TS-ASYNC-001: Prefer async/await
Use `async/await` for all asynchronous control flow. Raw `.then()` chains are forbidden except in utility wrappers.

**Compliant:**
```
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

**Forbidden:** `api.get("/users/1").then(r => r.data)`

### TS-ASYNC-002: Error Handling in Async
Every `await` in a critical path MUST be wrapped in try/catch or the function MUST propagate the error to a caller that handles it.

### TS-ASYNC-003: Concurrent Execution
Use `Promise.all()` for independent parallel operations. Sequential `await` of independent calls is forbidden.

**Compliant:**
```
const [users, config] = await Promise.all([fetchUsers(), fetchConfig()]);
```

**Forbidden:**
```
const users = await fetchUsers();
const config = await fetchConfig(); // independent but sequential
```

### TS-ASYNC-004: Never Mix Callbacks and Promises
Functions MUST return either a Promise or accept a callback, never both. New code MUST always return Promises.

### TS-ASYNC-005: Async Function Return Type
All async functions MUST explicitly declare `Promise<T>` return type. Naked `Promise` (without type parameter) is forbidden.

**Compliant:** `async function load(): Promise<Config>`
**Forbidden:** `async function load(): Promise`

### TS-ASYNC-006: Promise.race Timeout
Network calls and long operations MUST have a timeout. Use `Promise.race()` with a timeout promise or `AbortController` with `fetch`.

### TS-ASYNC-007: No Floating Promises
Every returned Promise MUST be awaited or explicitly handled. Use `void` prefix if intentionally discarding (with comment explaining why).

**Forbidden:** `fetchUsers()` (without await or .then)
**Compliant:** `void fetchUsers() // fire-and-forget, no result needed`
