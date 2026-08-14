# OpenAPI allOf Refactoring — Shared Models & Extracted Enums

## Summary

Refactored the OpenAPI spec files in `job-backend/guideline-service-sdk/src/main/resources/` to replace entity-specific inline embedded objects with shared, named top-level schemas, and extract inline enums to named enum schemas.

## Files Modified

All 12 modified files in `job-backend/guideline-service-sdk/src/main/resources/`:
- `guideline-service.yaml` (central definitions)
- `person.yaml`
- `plan.yaml`
- `job.yaml`
- `master.yaml` (formatting only)
- `core.yaml` (formatting only)
- `client.yaml` (formatting only)
- `identity.yaml` (formatting only)
- `event.yaml` (formatting only)
- `constraints.yaml` (formatting only)
- `plan_remote.yaml` (formatting only)
- `.spectral.json` (formatting only)

## Shared Schemas Created (in `guideline-service.yaml#/components/schemas/`)

| Schema | Used By | Properties |
|--------|---------|------------|
| `Concurrency` | Plan, Job | `mode` (ConcurrencyMode), `maxConcurrent`, `attentionCapacity`, `attentionCost` |
| `FairnessPolicy` | Person, Plan, Job (future) | `type` (FairnessType), `threshold`, `weight`, `scope` (FairnessScope) |
| `BudgetLimit` | Plan | `amount`, `currency`, `period` (BudgetPeriod) |
| `TimeWindow` | Job | `start`, `end`, `days`, `type` (TimeWindowType) |

## Entity-Specific Schemas (kept as named top-level schemas)

| Schema | Entity | Reason |
|--------|--------|--------|
| `Calendar` | Person (Person.calendar) | Only used by Person |
| `ResourceAccess` | Person (Person.resourceAccess) | Only used by Person |
| `JobPriority` | Job (Job.priority) | Only used by Job |

## Enum Schemas Created

| Enum Schema | Values | Used By |
|-------------|--------|---------|
| `ConcurrencyMode` | `PARALLEL, SHARED_ATTENTION` | Concurrency.mode |
| `FairnessType` | `WORKLOAD_BALANCE, UTILIZATION_BALANCE` | FairnessPolicy.type |
| `FairnessScope` | `GLOBAL, TEAM, DEPARTMENT` | FairnessPolicy.scope |
| `BudgetPeriod` | `DAILY, WEEKLY, MONTHLY, ANNUAL` | BudgetLimit.period |
| `TimeWindowType` | `STRICT, PREFERRED` | TimeWindow.type |
| `PriorityLevel` | `CRITICAL, HIGH, MEDIUM, LOW` | JobPriority.level |

## Cross-File Reference Strategy

Shared schemas are defined once in `guideline-service.yaml`. Sub-files reference them via `$ref` wrappers:

- `person.yaml` → `Calendar`, `ResourceAccess`, `FairnessPolicy` as `$ref: 'guideline-service.yaml#/components/schemas/...'`
- `plan.yaml` → `BudgetLimit`, `FairnessPolicy`, `Concurrency` as `$ref: 'guideline-service.yaml#/components/schemas/...'`
- `job.yaml` → `Concurrency`, `TimeWindow` as `$ref: 'guideline-service.yaml#/components/schemas/...'`; `JobPriority` kept inline (entity-specific)

## Removed Entity-Specific Schemas

The following entity-specific schemas were removed (replaced by shared equivalents):
- `PersonCalendar` → `Calendar`
- `PersonResourceAccess` → `ResourceAccess`
- `PersonFairnessPolicy` → `FairnessPolicy`
- `PlanBudgetLimit` → `BudgetLimit`
- `PlanFairnessPolicy` → `FairnessPolicy`
- `PlanConcurrency` → `Concurrency`
- `JobConcurrency` → `Concurrency`
- `JobTimeWindow` → `TimeWindow`

## Verification

- ✅ All 10 YAML files pass `yaml.safe_load()` validation
- ✅ No stale entity-specific schema names remain
- ✅ All entity property `$ref`s point to shared schemas
- ✅ All enum schemas are referenced with `$ref` from their parent schemas
- ✅ No inline `{type: object, ...}` inside `allOf` blocks remain
