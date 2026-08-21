---
scope: Java
tooling_deferral: true
override_precedence: project-local
---

# Java Error Handling Rules

### JAVA-ERR-001: Exception Type Selection
Use checked exceptions for recoverable errors. Use unchecked exceptions (RuntimeException subclasses) for programming errors. Never throw `Exception` or `Throwable` directly.

**Compliant:** `throw new IllegalArgumentException("invalid input")`
**Forbidden:** `throw new Exception("error")`, `throw new Throwable("error")`

### JAVA-ERR-002: Exception Messages
Exception messages MUST describe what went wrong and include relevant context. Never throw exceptions with empty or generic messages.

**Compliant:** `throw new IllegalArgumentException("userId must be positive, got: " + userId)`
**Forbidden:** `throw new IllegalArgumentException("error")`

### JAVA-ERR-003: Catch Specific Exceptions
Catch blocks MUST catch specific exception types. Catching `Exception` or `Throwable` is forbidden unless at the top-level error handler.

**Compliant:**
```
try {
    parseConfig();
} catch (IOException e) {
    log.error("Failed to read config", e);
    throw new ConfigException("config file missing", e);
}
```

**Forbidden:** `catch (Exception e) { ... }`

### JAVA-ERR-004: Exception Chaining
When re-throwing exceptions, MUST preserve the original exception as the cause.

**Compliant:** `throw new ServiceException("operation failed", cause)`
**Forbidden:** `throw new ServiceException("operation failed")` (when cause exists)

### JAVA-ERR-005: Empty Catch Blocks
Empty catch blocks are forbidden. Either handle the exception, log it, or document why it's ignored with a comment.

**Forbidden:** `catch (IOException e) {}`

### JAVA-ERR-006: Finally Block Usage
`finally` blocks MUST NOT contain return statements. Use try-with-resources for resource cleanup.

### JAVA-ERR-007: Custom Exception Hierarchy
Custom exceptions MUST extend `Exception` (checked) or `RuntimeException` (unchecked). Create a base exception for the module and subclass from it.

**Compliant:** `public class ServiceException extends RuntimeException`
**Forbidden:** `public class ServiceException extends Throwable`
