import { afterAll, beforeAll, expect, test } from "bun:test"
import { tool } from "@opencode-ai/plugin"
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import toolDef from "../tools/autopilot_state.ts"
import { parseState, resolveGitBase } from "../autopilot/autopilot-state-core.mjs"

const SLUG = "lifecycle-e2e"
const zod = tool.schema
const stateSchema = zod.object(toolDef.args as any)
const projectRoot = join(import.meta.dir, "..", "..")
const stateFile = () => join(tmpRoot, ".autopilot", "change-" + SLUG, "state.json")

let tmpRoot: string
let ctx: any

const call = async (op: string, args: Record<string, unknown> = {}): Promise<string> => {
  const parsed = stateSchema.safeParse({ op, ...args })
  if (!parsed.success) {
    throw new Error("args validation failed: " + JSON.stringify(parsed.error.flatten().fieldErrors))
  }
  const out = await toolDef.execute(parsed.data as any, ctx)
  return typeof out === "string" ? out : out.output
}

const read = async () => JSON.parse(await call("read", { slug: SLUG }))

beforeAll(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), "autopilot-lifecycle-"))
  ctx = {
    worktree: tmpRoot,
    directory: tmpRoot,
    sessionID: "test",
    messageID: "1",
    agent: "autopilot",
    abort: new AbortController().signal,
    metadata: () => {},
    ask: async () => {},
  }
})

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true })
})

test("arg schema rejects unknown op and missing slug", () => {
  expect(stateSchema.safeParse({ op: "init" }).success).toBe(false) // slug required
  expect(stateSchema.safeParse({ op: "bogus", slug: SLUG }).success).toBe(false) // op enum
  expect(stateSchema.safeParse({ op: "transition", slug: SLUG, to: "COMMIT" }).success).toBe(true)
})

test("read before init returns {exists:false}", async () => {
  expect(JSON.parse(await call("read", { slug: "ghost" }))).toEqual({ exists: false })
})

test("invalid slug is rejected", async () => {
  await expect(call("init", { slug: "bad slug!" })).rejects.toThrow(/invalid slug/)
})

test("transition before init fails", async () => {
  await expect(call("transition", { slug: SLUG, to: "COMMIT" })).rejects.toThrow(/no state for change/)
})

test("missing op-required args fail inside execute", async () => {
  await expect(call("transition", { slug: SLUG })).rejects.toThrow(/missing required arg 'to'/)
  await expect(call("check", { slug: SLUG, target: "plan" })).rejects.toThrow(/missing required arg 'id'/)
  await expect(call("review", { slug: SLUG, gate: "spec" })).rejects.toThrow(/missing required arg 'cycle'/)
  await expect(call("blocker", { slug: SLUG })).rejects.toThrow(/missing required arg 'text'/)
})

test("full lifecycle init -> SPEC -> DONE", async () => {
  // init
  const initRes = JSON.parse(await call("init", { slug: SLUG }))
  expect(initRes).toEqual({ exists: true, slug: SLUG, status: "SPEC", base: "root", path: stateFile() })
  await expect(call("init", { slug: SLUG })).rejects.toThrow(/state already exists/)

  let st = await read()
  expect(st.slug).toBe(SLUG)
  expect(st.status).toBe("SPEC")
  expect(st.base).toBe("root")
  for (const k of ["spec", "review-spec", "subspec", "review-subspec", "apply", "review-code", "commit", "archive"]) {
    expect(st.plan[k]).toBe(false)
  }
  expect(st.reviews).toEqual([])
  expect(st.tasks).toEqual([])
  expect(st.blockers).toEqual([])
  expect(st.log).toEqual([])

  // illegal jump from SPEC
  await expect(call("transition", { slug: SLUG, to: "COMMIT" })).rejects.toThrow(/invalid transition/)
  st = await read()
  expect(st.status).toBe("SPEC")

  // SPEC -> REVIEW-SPEC (auto-checks plan.spec, logs a structured entry)
  await call("transition", { slug: SLUG, to: "REVIEW-SPEC" })
  st = await read()
  expect(st.status).toBe("REVIEW-SPEC")
  expect(st.plan.spec).toBe(true)
  expect(st.plan["review-spec"]).toBe(false)
  expect(st.log.length).toBe(1)
  expect(st.log[0]).toMatchObject({ phase: "SPEC", actor: "autopilot", event: "transition", result: "REVIEW-SPEC" })
  expect(st.log[0].time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)

  // review spec cycle 1 FAIL -> rework -> cycle 1 passes (upsert)
  await call("review", { slug: SLUG, gate: "spec", cycle: 1, verdict: "FAIL", critical: 2, major: 1, report: join(tmpRoot, ".autopilot", "change-" + SLUG, "review-spec-1.md") })
  st = await read()
  expect(st.reviews.length).toBe(1)
  expect(st.reviews[0].verdict).toBe("FAIL")
  await call("transition", { slug: SLUG, to: "SPEC" }) // rework
  st = await read()
  expect(st.status).toBe("SPEC")
  expect(st.plan.spec).toBe(true) // rework keeps spec checked
  await call("transition", { slug: SLUG, to: "REVIEW-SPEC" })
  await call("review", { slug: SLUG, gate: "spec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: join(tmpRoot, ".autopilot", "change-" + SLUG, "review-spec-1.md") })
  st = await read()
  expect(st.reviews.length).toBe(1) // same gate+cycle upserts, no new row
  expect(st.reviews[0].verdict).toBe("PASS")

  // REVIEW-SPEC -> SUBSPEC -> REVIEW-SUBSPEC -> APPLY
  await call("transition", { slug: SLUG, to: "SUBSPEC" })
  st = await read()
  expect(st.status).toBe("SUBSPEC")
  expect(st.plan["review-spec"]).toBe(true)
  await call("transition", { slug: SLUG, to: "REVIEW-SUBSPEC" })
  st = await read()
  expect(st.status).toBe("REVIEW-SUBSPEC")
  expect(st.plan.subspec).toBe(true)
  await call("review", { slug: SLUG, gate: "subspec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r-sub.md" })
  await call("transition", { slug: SLUG, to: "APPLY" })
  st = await read()
  expect(st.status).toBe("APPLY")
  expect(st.plan["review-subspec"]).toBe(true)

  // tasks: insert, toggle, insert again, missing label error
  await call("check", { slug: SLUG, target: "task", id: "1.1", checked: true, label: "implement foo" })
  st = await read()
  expect(st.tasks.length).toBe(1)
  expect(st.tasks[0]).toMatchObject({ id: "1.1", checked: true, text: "implement foo" })
  await call("check", { slug: SLUG, target: "task", id: "1.1", checked: false })
  st = await read()
  expect(st.tasks[0].checked).toBe(false)
  await call("check", { slug: SLUG, target: "task", id: "1.2", checked: true, label: "implement bar" })
  st = await read()
  expect(st.tasks.length).toBe(2)
  await expect(call("check", { slug: SLUG, target: "task", id: "9.9", checked: true })).rejects.toThrow(/no label/)

  // plan toggle + restore
  await call("check", { slug: SLUG, target: "plan", id: "spec", checked: false })
  st = await read()
  expect(st.plan.spec).toBe(false)
  await call("check", { slug: SLUG, target: "plan", id: "spec", checked: true })
  await expect(call("check", { slug: SLUG, target: "plan", id: "bogus", checked: true })).rejects.toThrow(/unknown plan item/)

  // APPLY -> REVIEW-CODE -> COMMIT
  await call("transition", { slug: SLUG, to: "REVIEW-CODE" })
  st = await read()
  expect(st.status).toBe("REVIEW-CODE")
  expect(st.plan.apply).toBe(true)
  await call("review", { slug: SLUG, gate: "code", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r-code.md" })
  st = await read()
  expect(st.reviews.length).toBe(3)
  await call("transition", { slug: SLUG, to: "COMMIT" })
  st = await read()
  expect(st.status).toBe("COMMIT")
  expect(st.plan["review-code"]).toBe(true)

  // blocker + BLOCKED round trip
  await call("blocker", { slug: SLUG, text: "litellm down" })
  expect(await call("blocker", { slug: SLUG, text: "agent ran out of budget" })).toBe('["litellm down","agent ran out of budget"]')
  await call("transition", { slug: SLUG, to: "BLOCKED" })
  st = await read()
  expect(st.status).toBe("BLOCKED")
  expect(st.plan.commit).toBe(false) // no plan auto-check on blocked edges
  await call("transition", { slug: SLUG, to: "COMMIT" }) // unblock
  st = await read()
  expect(st.status).toBe("COMMIT")

  // log op returns a structured entry; it persists verbatim
  const line = await call("log", { slug: SLUG, phase: "COMMIT", actor: "autopilot", event: "noop", result: "empty diff" })
  st = await read()
  expect(st.log[st.log.length - 1]).toEqual({ time: JSON.parse(line).time, phase: "COMMIT", actor: "autopilot", event: "noop", result: "empty diff" })

  // COMMIT -> ARCHIVE -> DONE
  await call("transition", { slug: SLUG, to: "ARCHIVE" })
    .then(() => call("transition", { slug: SLUG, to: "DONE" }))
  st = await read()
  expect(st.status).toBe("DONE")
  for (const k of ["spec", "review-spec", "subspec", "review-subspec", "apply", "review-code", "commit", "archive"]) {
    expect(st.plan[k]).toBe(true)
  }
  expect(st.reviews.length).toBe(3)
  expect(st.tasks.length).toBe(2)
  expect(st.blockers.length).toBe(2)
  expect(st.log.length).toBeGreaterThan(3)

  // DONE is terminal
  await expect(call("transition", { slug: SLUG, to: "ARCHIVE" })).rejects.toThrow(/invalid transition/)
})

test("disk state file is valid JSON and no temp files leak", async () => {
  const raw = readFileSync(stateFile(), "utf8")
  const onDisk = parseState(raw)
  expect(onDisk.status).toBe("DONE")
  expect(Object.values(onDisk.plan).every(Boolean)).toBe(true)
  const changeDir = readdirSync(join(tmpRoot, ".autopilot", "change-" + SLUG))
  expect(changeDir).toContain("state.json")
  expect(changeDir.some((f) => f.startsWith(".tmp-"))).toBe(false)
  expect(readdirSync(join(tmpRoot, ".autopilot")).some((f) => f.startsWith(".tmp-"))).toBe(false)
})

test("corrupt state.json is rejected on read and transition", async () => {
  const corruptSlug = "corrupt-e2e"
  await call("init", { slug: corruptSlug })
  const f = join(tmpRoot, ".autopilot", "change-" + corruptSlug, "state.json")
  const base = JSON.parse(readFileSync(f, "utf8"))

  const bad = (mut: (s: any) => any) => {
    const s = JSON.parse(JSON.stringify(base))
    mut(s)
    writeFileSync(f, JSON.stringify(s), "utf8")
  }

  bad((s) => { s.status = "BOGUS" })
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/invalid status/)
  await expect(call("transition", { slug: corruptSlug, to: "COMMIT" })).rejects.toThrow(/invalid status/)

  bad((s) => { delete s.plan.apply })
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/plan line missing: apply/)

  bad((s) => { s.log = [{ time: "2026-09-19T10:00", phase: "SPEC", actor: "autopilot", event: null, result: "x" }] })
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/log entry missing event/)

  bad((s) => { s.stray = true })
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/unknown top-level key: stray/)

  bad((s) => { s.slug = "other-change" })
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/does not match change slug/)

  writeFileSync(f, "{ not json", "utf8")
  await expect(call("read", { slug: corruptSlug })).rejects.toThrow(/not valid JSON/)
})

test("slugs are independent", async () => {
  expect(JSON.parse(await call("read", { slug: "other-change" }))).toEqual({ exists: false })
})

test("resolveGitBase returns a sha in the real repo", () => {
  const base = resolveGitBase(projectRoot)
  expect(base).toMatch(/^[0-9a-f]{7,40}$/)
})

test("next_phaseProgression_reportsCorrectDispatchAndTransition", async () => {
  const n = "next-e2e"
  await call("init", { slug: n })
  expect(JSON.parse(await call("next", { slug: n }))).toEqual({
    status: "SPEC",
    next: "dispatch architect for SPEC",
    dispatch: "architect",
    transition: "SPEC -> REVIEW-SPEC",
    pending: [],
  })

  await call("log", { slug: n, phase: "SPEC", actor: "architect", event: "return", result: "done" })
  const specReturned = JSON.parse(await call("next", { slug: n }))
  expect(specReturned.dispatch).toBeNull()
  expect(specReturned.next).toBe("transition to REVIEW-SPEC")
  expect(specReturned.transition).toBe("SPEC -> REVIEW-SPEC")

  await call("transition", { slug: n, to: "REVIEW-SPEC" })
  const r1 = JSON.parse(await call("next", { slug: n }))
  expect(r1.dispatch).toBe("reviewer")
  expect(r1.transition).toBeNull()
  expect(r1.next).toContain("cycle 1")

  await call("review", { slug: n, gate: "spec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r.md" })
  expect(JSON.parse(await call("next", { slug: n })).transition).toBe("REVIEW-SPEC -> SUBSPEC")

  await call("transition", { slug: n, to: "SUBSPEC" })
  await call("transition", { slug: n, to: "REVIEW-SUBSPEC" })
  await call("review", { slug: n, gate: "subspec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r2.md" })
  await call("transition", { slug: n, to: "APPLY" })

  await call("check", { slug: n, target: "task", id: "2.1", checked: false, label: "build endpoint" })
  const a1 = JSON.parse(await call("next", { slug: n }))
  expect(a1.dispatch).toBe("impl-worker")
  expect(a1.transition).toBeNull()
  expect(a1.pending).toEqual(["2.1 build endpoint"])

  await call("check", { slug: n, target: "task", id: "2.1", checked: true })
  // REVIEW-CODE waits for a PASS row of its own
  await call("transition", { slug: n, to: "REVIEW-CODE" })
  const rc = JSON.parse(await call("next", { slug: n }))
  expect(rc.dispatch).toBe("reviewer")
  expect(rc.transition).toBeNull()

  expect(JSON.parse(await call("next", { slug: "ghost-next" }))).toEqual({ exists: false })
})