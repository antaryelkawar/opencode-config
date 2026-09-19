import { execFileSync } from "node:child_process"
import { renameSync, writeFileSync } from "node:fs"

export const STATUSES = [
  "SPEC",
  "REVIEW-SPEC",
  "SUBSPEC",
  "REVIEW-SUBSPEC",
  "APPLY",
  "REVIEW-CODE",
  "COMMIT",
  "ARCHIVE",
  "DONE",
  "BLOCKED",
]

export const ACTORS = [
  "autopilot",
  "architect",
  "designer",
  "reviewer",
  "impl-worker",
  "ui-impl-worker",
  "verifier",
  "user",
]

export const PLAN_KEYS = [
  "spec",
  "review-spec",
  "subspec",
  "review-subspec",
  "apply",
  "review-code",
  "commit",
  "archive",
]

export const TRANSITIONS = {
  SPEC: ["REVIEW-SPEC"],
  "REVIEW-SPEC": ["SUBSPEC", "SPEC"],
  SUBSPEC: ["REVIEW-SUBSPEC"],
  "REVIEW-SUBSPEC": ["APPLY", "SUBSPEC"],
  APPLY: ["REVIEW-CODE"],
  "REVIEW-CODE": ["COMMIT", "APPLY"],
  COMMIT: ["ARCHIVE"],
  ARCHIVE: ["DONE"],
  DONE: [],
  BLOCKED: ["SPEC", "REVIEW-SPEC", "SUBSPEC", "REVIEW-SUBSPEC", "APPLY", "REVIEW-CODE", "COMMIT", "ARCHIVE"],
}

export const PLAN_ITEM_FOR = {
  SPEC: "spec",
  "REVIEW-SPEC": "review-spec",
  SUBSPEC: "subspec",
  "REVIEW-SUBSPEC": "review-subspec",
  APPLY: "apply",
  "REVIEW-CODE": "review-code",
  COMMIT: "commit",
  ARCHIVE: "archive",
}

const REWORK_EDGES = [
  ["REVIEW-SPEC", "SPEC"],
  ["REVIEW-SUBSPEC", "SUBSPEC"],
  ["REVIEW-CODE", "APPLY"],
]

const REVIEW_GATES = ["spec", "subspec", "code"]
const REVIEW_VERDICTS = ["PASS", "FAIL"]
const TOP_KEYS = ["slug", "status", "base", "plan", "tasks", "reviews", "log", "blockers"]

export function planItemFor(from, to) {
  if (from === "BLOCKED" || to === "BLOCKED") return null
  const reworked = REWORK_EDGES.some(([f, t]) => f === from && t === to)
  if (reworked) return null
  return PLAN_ITEM_FOR[from] ?? null
}

export function canTransition(from, to) {
  if (from === to) return false
  if (to === "BLOCKED") return from !== "DONE"
  const allowed = TRANSITIONS[from] ?? []
  return allowed.includes(to)
}

export function nowTimestamp() {
  return new Date().toISOString().slice(0, 16)
}

export function slugValid(slug) {
  return /^[A-Za-z0-9._-]+$/.test(slug)
}

export function createInitialState(slug, base) {
  const plan = {}
  for (const key of PLAN_KEYS) plan[key] = false
  return {
    slug,
    status: "SPEC",
    base: base ?? "root",
    plan,
    tasks: [],
    reviews: [],
    log: [],
    blockers: [],
  }
}

export function serializeState(state) {
  return JSON.stringify(state, null, 2) + "\n"
}

export function parseState(text) {
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`state.json is not valid JSON: ${e.message}`)
  }
}

export function validateState(state, expectedSlug) {
  const errors = []
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return ["state is not an object"]
  }

  for (const key of Object.keys(state)) {
    if (!TOP_KEYS.includes(key)) errors.push(`unknown top-level key: ${key}`)
  }
  for (const key of TOP_KEYS) {
    if (!(key in state)) errors.push(`missing key: ${key}`)
  }

  if (typeof state.slug !== "string" || !slugValid(state.slug)) {
    errors.push(`invalid slug in state: ${state.slug}`)
  } else if (expectedSlug !== undefined && state.slug !== expectedSlug) {
    errors.push(`state slug '${state.slug}' does not match change slug '${expectedSlug}'`)
  }

  if (!STATUSES.includes(state.status)) {
    errors.push(`invalid status: ${state.status} (expected one of ${STATUSES.join(", ")})`)
  }

  if (typeof state.base !== "string" || !state.base) {
    errors.push("missing base (git sha recorded at init, or 'root')")
  }

  if (!state.plan || typeof state.plan !== "object" || Array.isArray(state.plan)) {
    errors.push("plan must be an object")
  } else {
    for (const key of PLAN_KEYS) {
      if (!(key in state.plan)) errors.push(`plan line missing: ${key}`)
    }
    for (const [key, value] of Object.entries(state.plan)) {
      if (!PLAN_KEYS.includes(key)) errors.push(`unknown plan item: ${key}`)
      else if (typeof value !== "boolean") errors.push(`plan item '${key}' must be boolean`)
    }
  }

  if (!Array.isArray(state.tasks)) {
    errors.push("tasks must be an array")
  } else {
    for (const t of state.tasks) {
      if (!t || typeof t !== "object") {
        errors.push("task must be an object")
        continue
      }
      if (typeof t.id !== "string" || !t.id) errors.push("task with missing id")
      if (typeof t.checked !== "boolean") errors.push(`task ${t.id}: checked must be boolean`)
      if (typeof t.text !== "string" || !t.text) errors.push(`task ${t.id}: missing text`)
    }
  }

  if (!Array.isArray(state.reviews)) {
    errors.push("reviews must be an array")
  } else {
    for (const r of state.reviews) {
      if (!r || typeof r !== "object") {
        errors.push("review must be an object")
        continue
      }
      if (!REVIEW_GATES.includes(r.gate)) errors.push(`review gate invalid: ${r.gate}`)
      if (!Number.isInteger(r.cycle) || r.cycle < 1) errors.push(`review ${r.gate}: cycle must be an integer >= 1`)
      if (!REVIEW_VERDICTS.includes(r.verdict)) errors.push(`review ${r.gate}: verdict invalid: ${r.verdict}`)
      if (!Number.isInteger(r.critical) || r.critical < 0) errors.push(`review ${r.gate}: critical must be an integer >= 0`)
      if (!Number.isInteger(r.major) || r.major < 0) errors.push(`review ${r.gate}: major must be an integer >= 0`)
      if (typeof r.report !== "string" || !r.report) errors.push(`review ${r.gate}: missing report path`)
    }
  }

  if (!Array.isArray(state.log)) {
    errors.push("log must be an array")
  } else {
    for (const l of state.log) {
      if (!l || typeof l !== "object") {
        errors.push("log entry must be an object")
        continue
      }
      if (typeof l.time !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(l.time)) {
        errors.push(`log entry malformed time: ${JSON.stringify(l.time)}`)
      }
      if (!STATUSES.includes(l.phase)) errors.push(`log entry invalid phase: ${l.phase}`)
      if (!ACTORS.includes(l.actor)) errors.push(`log entry invalid actor: ${l.actor}`)
      if (typeof l.event !== "string" || !l.event) errors.push("log entry missing event")
      if (typeof l.result !== "string" || !l.result) errors.push("log entry missing result")
    }
  }

  if (!Array.isArray(state.blockers)) {
    errors.push("blockers must be an array")
  } else {
    for (const b of state.blockers) {
      if (typeof b !== "string" || !b) errors.push(`malformed blocker: ${JSON.stringify(b)}`)
    }
  }

  return errors
}

export function assertValidState(state, expectedSlug) {
  const errors = validateState(state, expectedSlug)
  if (errors.length) throw new Error("state.json invalid: " + errors.join("; "))
}

export function newLogEntry(phase, actor, event, result) {
  return { time: nowTimestamp(), phase, actor, event, result }
}

export function applyTransition(state, from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`invalid transition ${from} -> ${to} (allowed: ${[...(TRANSITIONS[from] ?? []), "BLOCKED"].join(", ")})`)
  }
  const next = structuredClone(state)
  next.status = to
  const item = planItemFor(from, to)
  if (item) next.plan[item] = true
  next.log.push(newLogEntry(from, "autopilot", "transition", to))
  return next
}

export function applyCheck(state, section, id, checked, label) {
  const next = structuredClone(state)
  if (section === "plan") {
    if (!PLAN_KEYS.includes(id)) throw new Error(`unknown plan item: ${id}`)
    next.plan[id] = checked
    return next
  }
  if (section === "task") {
    let found = false
    for (const t of next.tasks) {
      if (t.id === id) {
        t.checked = checked
        found = true
        break
      }
    }
    if (!found) {
      if (!label) throw new Error(`task not found and no label provided: ${id}`)
      next.tasks.push({ id, text: label, checked })
    }
    return next
  }
  throw new Error(`unknown check target: ${section}`)
}

export function applyLog(state, entry) {
  const next = structuredClone(state)
  next.log.push(entry)
  return next
}

export function applyReview(state, row) {
  if (!REVIEW_GATES.includes(row.gate)) throw new Error(`invalid gate: ${row.gate}`)
  if (!Number.isInteger(row.cycle) || row.cycle < 1) throw new Error("cycle must be an integer >= 1")
  if (!REVIEW_VERDICTS.includes(row.verdict)) throw new Error(`invalid verdict: ${row.verdict}`)
  if (!Number.isInteger(row.critical) || row.critical < 0) throw new Error("critical must be an integer >= 0")
  if (!Number.isInteger(row.major) || row.major < 0) throw new Error("major must be an integer >= 0")
  const next = structuredClone(state)
  const idx = next.reviews.findIndex((r) => r.gate === row.gate && r.cycle === row.cycle)
  if (idx >= 0) next.reviews[idx] = { ...row }
  else next.reviews.push({ ...row })
  return next
}

export function applyBlocker(state, text) {
  const next = structuredClone(state)
  next.blockers.push(text)
  return next
}

export function nextStep(state) {
  const status = state.status
  const reviews = state.reviews ?? []
  const tasks = state.tasks ?? []
  const hasPass = (gate) => reviews.some((r) => r.gate === gate && r.verdict === "PASS")
  const nextCycle = (gate) => reviews.filter((r) => r.gate === gate).reduce((max, r) => Math.max(max, r.cycle), 0) + 1
  const pendingTasks = tasks.filter((t) => !t.checked).map((t) => `${t.id} ${t.text}`.trim())
  const returned = (actor) => state.log.some((e) => e.actor === actor && e.event === "return")

  const step = (dispatch, action, transition, pending = []) => ({ status, next: action, dispatch, transition, pending })

  switch (status) {
    case "SPEC":
      return returned("architect")
        ? step(null, "transition to REVIEW-SPEC", "SPEC -> REVIEW-SPEC")
        : step("architect", "dispatch architect for SPEC", "SPEC -> REVIEW-SPEC")
    case "REVIEW-SPEC":
      return hasPass("spec")
        ? step(null, "transition to SUBSPEC", "REVIEW-SPEC -> SUBSPEC")
        : step("reviewer", `dispatch reviewer (target: spec, cycle ${nextCycle("spec")})`, null)
    case "SUBSPEC":
      return returned("designer")
        ? step(null, "transition to REVIEW-SUBSPEC", "SUBSPEC -> REVIEW-SUBSPEC")
        : step("designer", "dispatch designer for SUBSPEC", "SUBSPEC -> REVIEW-SUBSPEC")
    case "REVIEW-SUBSPEC":
      return hasPass("subspec")
        ? step(null, "transition to APPLY", "REVIEW-SUBSPEC -> APPLY")
        : step("reviewer", `dispatch reviewer (target: subspec, cycle ${nextCycle("subspec")})`, null)
    case "APPLY":
      return pendingTasks.length
        ? step("impl-worker", `dispatch impl-worker for APPLY (pending: ${pendingTasks.join("; ")})`, null, pendingTasks)
        : step(null, "transition to REVIEW-CODE", "APPLY -> REVIEW-CODE")
    case "REVIEW-CODE":
      return hasPass("code")
        ? step(null, "transition to COMMIT", "REVIEW-CODE -> COMMIT")
        : step("reviewer", `dispatch reviewer (target: code, cycle ${nextCycle("code")})`, null)
    case "COMMIT":
      return step(null, "commit the change (stage the computed file set against base; user approves once)", "COMMIT -> ARCHIVE")
    case "ARCHIVE":
      return step(null, "openspec validate + archive the change, then mark DONE", "ARCHIVE -> DONE")
    case "DONE":
      return step(null, "change complete — nothing to do", null)
    case "BLOCKED":
      return step(null, "waiting on the user to unblock", null, state.blockers ?? [])
    default:
      return step(null, `unknown status ${status}`, null)
  }
}

export function atomicWrite(filePath, content) {
  const tmp = `${filePath}.tmp-${process.pid}`
  writeFileSync(tmp, content, "utf8")
  renameSync(tmp, filePath)
}

export function resolveGitBase(root) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return "root"
  }
}