---
scope: Java
tooling_deferral: true
override_precedence: project-local
---

# Java OOP Rules

### JAVA-OOP-001: Favor Composition over Inheritance
Inheritance MUST only be used for true "is-a" relationships. Use composition for "has-a" or code reuse.

**Compliant:** `class Car { private Engine engine; }`
**Forbidden:** `class Car extends Engine` (unless Car truly is an Engine)

### JAVA-OOP-002: Encapsulation
Fields MUST be private. Access via getters/setters only. Never expose mutable internal state directly.

**Compliant:** `private List<String> items; public List<String> getItems() { return Collections.unmodifiableList(items); }`
**Forbidden:** `public List<String> items;`

### JAVA-OOP-003: Final by Default
Classes and methods MUST be `final` unless explicitly designed for extension. Mark classes `final` by default.

### JAVA-OOP-004: Constructor Injection
Use constructor injection for dependencies. Field injection (`@Autowired` on fields) is forbidden.

**Compliant:**
```
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**Forbidden:** `@Autowired private UserRepository userRepository;`

### JAVA-OOP-005: Single Responsibility
A class MUST have only one reason to change. If a class exceeds 300 lines, it MUST be decomposed.

### JAVA-OOP-006: Interface Segregation
Clients MUST NOT be forced to depend on methods they do not use. Create small, focused interfaces rather than large, general-purpose ones.

### JAVA-OOP-007: Equals and HashCode
When overriding `equals()`, MUST also override `hashCode()`. Use `Objects.equals()` and `Objects.hash()` for implementation.

### JAVA-OOP-008: Avoid Getters for Internal State
Do not create getters just to expose internal state for external manipulation. Provide methods that operate on the state instead.

**Compliant:** `public void addToCart(Item item) { ... }`
**Forbidden:** `public List<Item> getCartItems()` (if caller modifies the list)
