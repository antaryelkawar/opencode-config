---
scope: Go
tooling_deferral: true
override_precedence: project-local
---

# Go Naming Rules

### GO-NAME-001: Package Names
Package names MUST be lowercase, single-word, and describe the package's purpose. Avoid underscores, hyphens, and plural forms.

**Compliant:** `http`, `user`, `config`
**Forbidden:** `httpServer`, `user_service`, `users`, `util`

### GO-NAME-002: Exported Identifiers
Exported functions, types, and constants MUST use PascalCase. Unexported identifiers MUST use camelCase.

### GO-NAME-003: Interface Names
Single-method interfaces MUST end in `-er` (e.g., `Reader`, `Writer`, `Handler`). Multi-method interfaces MUST describe the behavior, not the implementation (e.g., `io.Closer`, `http.Handler`).

### GO-NAME-004: Variable Names
Local variables MUST have short, descriptive names (1-3 words). Loop counters MAY use single letters (`i`, `j`, `k`). Avoid cryptic abbreviations.

### GO-NAME-005: Receiver Names
Method receivers MUST be 1-2 characters, lowercase, and consistent across all methods of a type. Use the first letter of the type or a meaningful abbreviation.

**Compliant:** `func (c *Client) Connect()`
**Forbidden:** `func (client *Client) Connect()`, `func (self *Client) Connect()`

### GO-NAME-006: Acronyms and Initialisms
Acronyms MUST be all-uppercase or all-lowercase consistently. Never mix case within an acronym.

**Compliant:** `HTTPClient`, `httpServer`, `ID`, `URL`
**Forbidden:** `HttpClient`, `httpserver`, `Id`, `Url`

### GO-NAME-007: Boolean Variables
Boolean variables MUST be named to read as a predicate. Prefix with `is`, `has`, `can`, `should`, or similar.

**Compliant:** `isValid`, `hasPermission`, `canRetry`
**Forbidden:** `valid`, `permission`, `retry`

### GO-NAME-008: Function Names
Functions MUST be named for what they do, not how they do it. Use verbs for actions, nouns for constructors.

**Compliant:** `NewClient()`, `ParseConfig()`, `ValidateInput()`
**Forbidden:** `ProcessData()`, `HandleStuff()`, `DoSomething()`
