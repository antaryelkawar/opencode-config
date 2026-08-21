---
scope: Java
tooling_deferral: true
override_precedence: project-local
---

# Java Naming Rules

### JAVA-NAME-001: Class Names
Class names MUST be PascalCase nouns or noun phrases. Abstract classes MUST start with `Abstract`. Test classes MUST end with `Test`.

**Compliant:** `UserService`, `AbstractPaymentProcessor`, `OrderServiceTest`
**Forbidden:** `userService`, `abstractPaymentProcessor`, `testOrderService`

### JAVA-NAME-002: Method Names
Method names MUST be camelCase verbs or verb phrases. Getters MUST be `get<Property>()`. Setters MUST be `set<Property>()`. Boolean getters MAY use `is<Property>()` or `has<Property>()`.

**Compliant:** `calculateTotal()`, `getUser()`, `isValid()`
**Forbidden:** `CalculateTotal()`, `getuser()`, `valid()`

### JAVA-NAME-003: Variable Names
Variable names MUST be camelCase and descriptive. Single-letter variables are forbidden except for loop counters (`i`, `j`, `k`) and lambdas.

**Compliant:** `userCount`, `totalAmount`
**Forbidden:** `uc`, `ta`, `x`, `y`

### JAVA-NAME-004: Constant Names
Constants MUST be SCREAMING_SNAKE_CASE. Only `static final` fields are constants.

**Compliant:** `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS`
**Forbidden:** `maxRetryCount`, `default_timeout`

### JAVA-NAME-005: Package Names
Package names MUST be all lowercase, no underscores. Follow reverse domain name convention.

**Compliant:** `com.example.userservice`
**Forbidden:** `com.Example.UserService`, `com.example.user_service`

### JAVA-NAME-006: Interface Names
Interface names MUST be nouns or adjectives. Avoid `I` prefix. Implementation classes MUST be named `<Interface>Impl` or `<Interface>Default`.

**Compliant:** `Serializable`, `UserRepository`, `UserRepositoryImpl`
**Forbidden:** `ISerializable`, `IUserRepository`

### JAVA-NAME-007: Enum Names
Enum type names MUST be PascalCase nouns. Enum constants MUST be SCREAMING_SNAKE_CASE.

**Compliant:** `OrderStatus.PENDING`, `Color.RED`
**Forbidden:** `orderStatus.pending`, `Color.Red`

### JAVA-NAME-008: Type Parameters
Type parameters MUST be single uppercase letters or descriptive PascalCase. Use `T` for single type, `E` for element, `K`/`V` for key/value, `R` for result.

**Compliant:** `List<T>`, `Map<K, V>`, `Result<Success, Failure>`
**Forbidden:** `List<t>`, `Map<key, value>`
