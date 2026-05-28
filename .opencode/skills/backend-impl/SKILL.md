---
name: backend-impl
description: Implement Java/Spring backend logic, APIs, and server-side code
compatibility: opencode
metadata:
  audience: developers
  workflow: implementation
---
## What I do
- Create REST APIs with Spring Boot
- Implement business logic in Java
- Design JPA/Hibernate database schemas
- Write server-side validation
- Implement Spring Security authentication/authorization
- Handle data processing and transformations
- Write unit and integration tests (JUnit, Mockito)

## When to use me
Use this skill when implementing server-side features, APIs, or database operations in the JobOptimizer project.

## Conventions
- Use the Service/Repository pattern (Spring stereotypes)
- Annotate entities with JPA annotations in CommonModels
- Place REST controllers in the respective service module
- Use constructor injection with `@RequiredArgsConstructor`
- Follow Java naming: PascalCase for classes, camelCase for methods/vars

## Guidelines
- Follow the project's coding conventions
- Use appropriate error handling with Spring `@ControllerAdvice`
- Consider scalability
- Implement proper logging (SLF4J)
- Follow OWASP security best practices
- Write testable code with Mockito mocks