import { tool } from "@opencode-ai/plugin"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  ACTORS,
  PLAN_KEYS,
  STATUSES,
  applyBlocker,
  applyCheck,
  applyLog,
  applyReview,
  applyTransition,
  assertValidState,
  atomicWrite,
  createInitialState,
  newLogEntry,
  nextStep,
  parseState,
  resolveGitBase,
  serializeState,
  slugValid,
} from "../autopilot/autopilot-state-core.mjs"

const GATES = ["spec", "subspec", "code"]
const CHECK_TARGETS = ["plan", "task"]
const VERDICTS = ["PASS", "FAIL"]
const OPS = ["init", "read", "transition", "check", "log", "review", "blocker", "next"]

function rootDir(context) {
  return context.worktree || context.directory
}

function statePath(root, slug) {
  return join(root, ".autopilot", "change-" + slug, "state.json")
}

function ensureSlug(slug) {
  if (!slugValid(slug)) {
    throw new Error(`invalid slug: ${slug} (allowed: A-Za-z0-9._-)`)
  }
}

function required(args, key, op) {
  if (args[key] === undefined) {
    throw new Error(`autopilot_state ${op}: missing required arg '${key}'`)
  }
  return args[key]
}

function readState(root, slug) {
  const p = statePath(root, slug)
  if (!existsSync(p)) throw new Error(`no state for change "${slug}" — call autopilot_state with op:init first`)
  const state = parseState(readFileSync(p, "utf8"))
  assertValidState(state, slug)
  return state
}

function mutateState(root, slug, fn) {
  const p = statePath(root, slug)
  const cur = readState(root, slug)
  const next = fn(cur)
  assertValidState(next, slug)
  atomicWrite(p, serializeState(next))
  return readState(root, slug)
}

export default tool({
  description: `Sole writer of the OpenSpec autopilot run record .autopilot/change-<slug>/state.json (raw edit/write of that file is hard-denied — it is a structured JSON record with strict validation). Select the operation via op. Verify every transition with op:read before dispatching the next phase.

op:init      — create state.json (canonical JSON record: slug, status SPEC, base, plan, tasks, reviews, log, blockers). Args: slug; optional base (git sha to record, defaults to git HEAD). Fails if state already exists.
op:read      — read the run record. Args: slug. Returns the state as JSON, or {exists:false} if no state.
op:transition— move to a legal status. Args: slug, to (${STATUSES.join(" | ")}). Atomically updates status, auto-checks the finished phase's plan line, and appends a structured log entry. Illegal transitions error with the allowed targets.
op:check     — check/uncheck a line. Args: slug, target (${CHECK_TARGETS.join("|")}), id, checked, optional label. plan ids: ${PLAN_KEYS.join(" | ")}; a task id is an openspec task id (e.g. 4.1) — toggling an existing task, or inserting {id, text, checked} when it does not exist yet (label = task text, required then).
op:log       — append a structured timestamped log entry. Args: slug, phase (${STATUSES.join(" | ")}), actor (${ACTORS.join(" | ")}), event, result.
op:review    — record/update a review gate row. Args: slug, gate (${GATES.join(" | ")}), cycle (>= 1), verdict (${VERDICTS.join(" | ")}), critical, major, report (path). Row keyed by gate + cycle.
op:blocker   — record a blocker. Args: slug, text. Appends the text to the blockers list.
op:next      — derive the immediate next step from the current state. Args: slug. Returns {status, next, dispatch, transition, pending}: the action to take now, the subagent to dispatch (null = autopilot itself), the transition that completes the phase (null until preconditions are met), and any pending work (unchecked tasks in APPLY, blockers while BLOCKED).`,
  args: {
    op: tool.schema.enum(OPS).describe("Operation to perform."),
    slug: tool.schema.string().describe("OpenSpec change slug. Alphanumeric, dot, underscore, dash only."),
    base: tool.schema.string().optional().describe("op:init only — git base sha to record (defaults to `git rev-parse HEAD`; 'root' if git fails)."),
    to: tool.schema
      .enum([...STATUSES])
      .optional()
      .describe("op:transition only — target status."),
    target: tool.schema.enum([...CHECK_TARGETS]).optional().describe("op:check only — checkbox section."),
    id: tool.schema
      .string()
      .optional()
      .describe("op:check only — plan key or openspec task id (e.g. 4.1)."),
    checked: tool.schema.boolean().optional().describe("op:check only — true to check, false to uncheck."),
    label: tool.schema.string().optional().describe("op:check only — task text; required when inserting a task that does not exist yet."),
    phase: tool.schema
      .enum([...STATUSES])
      .optional()
      .describe("op:log only — phase during which the event happened."),
    actor: tool.schema
      .enum([...ACTORS])
      .optional()
      .describe("op:log only — who caused the event."),
    event: tool.schema.string().optional().describe("op:log only — event name, e.g. dispatch, return, block, escalate."),
    result: tool.schema.string().optional().describe("op:log only — short result summary, e.g. done, PASS, FAIL, blocked."),
    gate: tool.schema.enum([...GATES]).optional().describe("op:review only — review gate."),
    cycle: tool.schema.number().int().min(1).optional().describe("op:review only — review cycle number (>= 1)."),
    verdict: tool.schema.enum([...VERDICTS]).optional().describe("op:review only — gate verdict."),
    critical: tool.schema.number().int().min(0).optional().describe("op:review only — critical findings count."),
    major: tool.schema.number().int().min(0).optional().describe("op:review only — major findings count."),
    report: tool.schema.string().optional().describe("op:review only — path to the review report file."),
    text: tool.schema.string().optional().describe("op:blocker only — blocker description."),
  },
  async execute(args, context) {
    const { op, slug = "" } = args
    ensureSlug(slug)
    const root = rootDir(context)
    const p = statePath(root, slug)

    switch (op) {
      case "init": {
        if (existsSync(p)) throw new Error(`state already exists: ${p}`)
        const resolvedBase = args.base ?? resolveGitBase(root)
        mkdirSync(join(root, ".autopilot", "change-" + slug), { recursive: true })
        atomicWrite(p, serializeState(createInitialState(slug, resolvedBase)))
        const state = readState(root, slug)
        return JSON.stringify({ exists: true, slug, status: state.status, base: state.base, path: p })
      }

      case "read": {
        if (!existsSync(p)) return JSON.stringify({ exists: false })
        return JSON.stringify(readState(root, slug))
      }

      case "transition": {
        const to = required(args, "to", op)
        const cur = readState(root, slug)
        const next = mutateState(root, slug, (state) => applyTransition(state, cur.status, to))
        return JSON.stringify(next)
      }

      case "check": {
        const target = required(args, "target", op)
        const id = required(args, "id", op)
        const checked = required(args, "checked", op)
        const next = mutateState(root, slug, (state) => applyCheck(state, target, id, checked, args.label))
        return JSON.stringify({ plan: next.plan, tasks: next.tasks })
      }

      case "log": {
        const entry = newLogEntry(required(args, "phase", op), required(args, "actor", op), required(args, "event", op), required(args, "result", op))
        mutateState(root, slug, (state) => applyLog(state, entry))
        return JSON.stringify(entry)
      }

      case "review": {
        const review = {
          gate: required(args, "gate", op),
          cycle: required(args, "cycle", op),
          verdict: required(args, "verdict", op),
          critical: required(args, "critical", op),
          major: required(args, "major", op),
          report: required(args, "report", op),
        }
        const next = mutateState(root, slug, (state) => applyReview(state, review))
        return JSON.stringify(next.reviews)
      }

      case "blocker": {
        const text = required(args, "text", op)
        const next = mutateState(root, slug, (state) => applyBlocker(state, text))
        return JSON.stringify(next.blockers)
      }

      case "next": {
        if (!existsSync(p)) return JSON.stringify({ exists: false })
        return JSON.stringify(nextStep(readState(root, slug)))
      }

      default:
        throw new Error(`autopilot_state: unknown op '${op}' (expected one of ${OPS.join(", ")})`)
    }
  },
})