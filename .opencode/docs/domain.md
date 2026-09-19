# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

## Payload scalar-lift rule (ADR-0001)

Any payload field used in a `WHERE`, `ORDER BY`, or join condition SHALL be
lifted to a real scalar column (or a dedicated derived/lookup table) at write
time. Range predicates, ordering, or filtering MUST be served by the lifted
scalar column. The system SHALL NOT rely on GIN `jsonb_path_ops` containment
indexes to serve ordering or range predicates -- GIN is for containment lookups
only. Scalar columns SHALL be maintained by the same write path/accessor that
mutates the payload, kept consistent within the same transaction/write, and
backed by table-level btree indexes for the ordering/range queries.

Canonical examples (the guard-test fixtures):

- BAD / must-lift: `payload #>> '{data,warranty_end}' AND $1::timestamptz` (a JSONB extraction cast in a filter predicate -- lift to e.g. `warranty_end timestamptz`).
- GOOD / lifted: `ORDER BY asset_category, warranty_end` (real lifted scalar columns, backed by a btree index).

Full decision record: `docs/adr/0001-scalar-lift.md`.