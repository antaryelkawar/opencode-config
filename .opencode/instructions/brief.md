# JobOptimizer

Multi-module Maven project (Java 17+, Spring Boot).

## Module structure
- CommonModels, CommonBaseService, CommonServicePom — shared libs
- IdentityService, JobService, MasterService, PlanService, ResourceService — services

## Build
- `mvn clean install -DskipTests` (full build)
- `mvn test -pl {module}` (module tests)

## Conventions
- Use PascalCase for class names, camelCase for methods/vars
- JPA entities in CommonModels
- REST controllers in each service module
- Service/Repository pattern
