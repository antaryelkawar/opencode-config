---
scope: Java
tooling_deferral: true
override_precedence: project-local
---

# Java Testing Rules

### JAVA-TEST-001: Test Class Naming
Test classes MUST be named `<ClassName>Test` and live in `src/test/java` mirroring the source package structure.

**Compliant:** `UserServiceTest` in `src/test/java/com/example/service/UserServiceTest.java`
**Forbidden:** `TestUserService`, `UserServiceTests`

### JAVA-TEST-002: Test Method Naming
Test methods MUST follow `should<ExpectedBehavior>When<Condition>` or `test<Method>_<Scenario>` pattern.

**Compliant:** `shouldReturnUserWhenValidIdProvided()`, `testParse_InvalidInput()`
**Forbidden:** `test1()`, `testUser()`, `test()`

### JAVA-TEST-003: Test Structure
All tests MUST follow Arrange-Act-Assert pattern. Use blank lines to separate phases.

**Compliant:**
```
@Test
void shouldCalculateTotal() {
    // Arrange
    Cart cart = new Cart();
    cart.add(new Item("Book", 10));

    // Act
    BigDecimal total = cart.calculateTotal();

    // Assert
    assertThat(total).isEqualByComparingTo(new BigDecimal("10"));
}
```

### JAVA-TEST-004: Assertion Library
Use AssertJ (`assertThat()`) or JUnit 5 assertions. Never use `assertTrue()` with manual equality checks.

**Compliant:** `assertThat(result).isEqualTo(expected)`
**Forbidden:** `assertTrue(result.equals(expected))`

### JAVA-TEST-005: Mocking Framework
Use Mockito for mocking. Mock external dependencies only. Never mock the class under test.

**Compliant:**
```
@Mock UserRepository userRepository;
@InjectMocks UserService userService;
```

### JAVA-TEST-006: Test Data Builders
For complex test objects, use the Builder pattern or test data factory methods to create instances.

**Compliant:** `User user = UserBuilder.aUser().withName("John").build()`
**Forbidden:** `User user = new User(1, "John", "john@example.com", ...)`

### JAVA-TEST-007: Exception Testing
Use `assertThatThrownBy()` or `assertThrows()` to test exceptions. Never use try-catch in tests.

**Compliant:**
```
assertThatThrownBy(() -> service.process(null))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessage("input cannot be null");
```

### JAVA-TEST-008: Test Isolation
Tests MUST NOT share mutable state. Use `@BeforeEach` to reset state. Never use static mutable fields in tests.
