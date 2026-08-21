---
scope: language-agnostic
tooling_deferral: true
override_precedence: project-local
---

# General Clean Code Rules

## Structure & Control Flow

### GC-001: Guard Clauses — Early Return
Functions MUST validate preconditions at the top and return early. Deep nesting beyond two levels is forbidden.

**Compliant:**
```
if !valid { return error }
// happy path continues
```

**Non-compliant:**
```
if valid {
  if ok {
    // happy path buried
  }
}
```

### GC-002: Single Responsibility per Function
A function MUST do exactly one thing. If a function body exceeds 40 lines (excluding blank lines and comments), it MUST be decomposed.

### GC-003: Cyclomatic Complexity Limit
A single function MUST NOT exceed a cyclomatic complexity of 10. Refactor immediately when exceeded.

### GC-004: Single Level of Abstraction
All statements within a function MUST operate at the same level of abstraction. Mixing high-level orchestration with low-level detail in the same function is forbidden.

### GC-005: Function Parameter Limit
A function MUST NOT accept more than 4 parameters. When more data is needed, use a struct/object to group related parameters.

## Modularity & Coupling

### GC-006: Dependency Direction
Higher-level modules MUST NOT depend on lower-level implementation details. Dependencies MUST point inward toward stable abstractions.

### GC-007: Feature Envy Prohibition
A function MUST NOT access more fields/properties of another object than of its own. Move the function to the object whose data it uses.

### GC-008: Circular Dependency Prohibition
Circular dependencies between modules, packages, or components are forbidden. Restructure to break the cycle.

## Naming & Clarity

### GC-009: Reveal Intent in Names
All public names (functions, classes, variables) MUST communicate purpose. Single-letter variables are forbidden outside loop counters and lambdas.

### GC-010: Boolean Names
Boolean variables and functions MUST be named to read as a true/false question: `isValid`, `hasPermission`, `canExecute`.

### GC-011: No Magic Numbers
Numeric literals other than 0 and 1 MUST NOT appear in code. Extract them into named constants.

## Change Hygiene

### GC-012: Minimal Change Surface
A change MUST touch the smallest number of files necessary. If a change requires modifications in more than 5 unrelated files, the design is wrong.

### GC-013: Boy Scout Rule
Every commit MUST leave the touched code cleaner than before. Fix small issues (unused imports, formatting drift, stale comments) immediately.

### GC-014: No Dead Code
Dead code — commented-out blocks, unreachable branches, unused variables — MUST be deleted, not preserved. Version control is the archive.

### GC-015: No God Objects
A single class, struct, or module MUST NOT exceed 300 lines. Exceeding this limit requires immediate decomposition.

## Comments & Documentation

### GC-016: Comments Explain Why, Not What
Comments MUST explain intent, rationale, or non-obvious constraints. Comments that restate what the code does are forbidden.

### GC-017: TODO Format
All TODO comments MUST follow the format: `TODO(<owner>): <description> — <date>`. Unowned TODOs are forbidden.
