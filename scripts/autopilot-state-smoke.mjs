import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  applyBlocker,
  applyCheck,
  applyLog,
  applyReview,
  applyTransition,
  atomicWrite,
  canTransition,
  createInitialState,
  newLogEntry,
  nextStep,
  parseState,
  serializeState,
  validateState,
} from "../.opencode/autopilot/autopilot-state-core.mjs"

let count = 0
const ok = () => count++

// ---- createInitialState + serialize/parse round trip ----
const initial = createInitialState("my-change", "deadbeef")
assert.equal(initial.slug, "my-change")
assert.equal(initial.status, "SPEC")
assert.equal(initial.base, "deadbeef")
assert.deepEqual(initial.plan, {
  spec: false, "review-spec": false, subspec: false, "review-subspec": false,
  apply: false, "review-code": false, commit: false, archive: false,
})
assert.deepEqual(initial.tasks, [])
assert.deepEqual(initial.reviews, [])
assert.deepEqual(initial.log, [])
assert.deepEqual(initial.blockers, [])
const text = serializeState(initial)
assert.equal(parseState(text).slug, "my-change")
assert.equal(validateState(parseState(text), "my-change").length, 0)
assert.throws(() => parseState("{ not json"), /not valid JSON/)
for (let i = 0; i < 14; i++) ok()

// ---- validateState strictness ----
const good = createInitialState("my-change", "abc123")
assert.equal(validateState(good, "my-change").length, 0)
assert.match(validateState({ ...good, status: "BOGUS" }, "my-change").join(" "), /invalid status/)
const noApply = { ...good, plan: { ...good.plan } }
delete noApply.plan.apply
assert.match(validateState(noApply, "my-change").join(" "), /plan line missing: apply/)
assert.match(validateState({ ...good, stray: true }, "my-change").join(" "), /unknown top-level key: stray/)
assert.match(
  validateState({ ...good, reviews: [{ gate: "code", cycle: 0, verdict: "PASS", critical: 0, major: 0, report: "r" }] }, "my-change").join(" "),
  /cycle must be an integer >= 1/
)
assert.match(validateState({ ...good, slug: "other" }, "my-change").join(" "), /does not match change slug/)
const missingEvent = { ...good, log: [{ ...newLogEntry("SPEC", "autopilot", "transition", "REVIEW-SPEC") }] }
delete missingEvent.log[0].event
assert.match(validateState(missingEvent, "my-change").join(" "), /log entry missing event/)
assert.match(validateState({ ...good, blockers: [""] }, "my-change").join(" "), /malformed blocker/)
for (let i = 0; i < 8; i++) ok()

// ---- canTransition ----
assert.equal(canTransition("SPEC", "REVIEW-SPEC"), true)
assert.equal(canTransition("SPEC", "SUBSPEC"), false)
assert.equal(canTransition("REVIEW-SPEC", "SUBSPEC"), true)
assert.equal(canTransition("REVIEW-SPEC", "SPEC"), true)
assert.equal(canTransition("REVIEW-SPEC", "COMMIT"), false)
assert.equal(canTransition("COMMIT", "ARCHIVE"), true)
assert.equal(canTransition("ARCHIVE", "DONE"), true)
assert.equal(canTransition("DONE", "ARCHIVE"), false)
assert.equal(canTransition("REVIEW-SPEC", "BLOCKED"), true)
assert.equal(canTransition("BLOCKED", "APPLY"), true)
assert.equal(canTransition("BLOCKED", "DONE"), false)
assert.equal(canTransition("SPEC", "SPEC"), false)
for (let i = 0; i < 12; i++) ok()

// ---- transition happy path (object in, object out) ----
let st = createInitialState("my-change", "abc123")
st = applyTransition(st, "SPEC", "REVIEW-SPEC")
assert.equal(st.status, "REVIEW-SPEC")
assert.equal(st.plan.spec, true)
assert.equal(st.plan["review-spec"], false)
assert.equal(st.log.length, 1)
assert.equal(st.log[0].event, "transition")
assert.equal(st.log[0].result, "REVIEW-SPEC")
assert.equal(st.log[0].actor, "autopilot")
assert.equal(st.blockers.length, 0)

// rework edge: no plan auto-check on the re-entry phase
st = applyTransition(st, "REVIEW-SPEC", "SPEC")
assert.equal(st.status, "SPEC")
assert.equal(st.plan.spec, true, "rework keeps spec checked")
assert.equal(st.log.length, 2)

// illegal edge throws
assert.throws(() => applyTransition(st, "SPEC", "COMMIT"), /invalid transition/)
assert.throws(() => applyTransition(st, "SPEC", "APPLY"), /invalid transition/)

// full walk to DONE
const walk = [
  ["SPEC", "REVIEW-SPEC"],
  ["REVIEW-SPEC", "SUBSPEC"],
  ["SUBSPEC", "REVIEW-SUBSPEC"],
  ["REVIEW-SUBSPEC", "APPLY"],
  ["APPLY", "REVIEW-CODE"],
  ["REVIEW-CODE", "COMMIT"],
  ["COMMIT", "ARCHIVE"],
  ["ARCHIVE", "DONE"],
]
for (const [a, b] of walk) st = applyTransition(st, a, b)
assert.equal(st.status, "DONE")
for (const key of ["spec", "review-spec", "subspec", "review-subspec", "apply", "review-code", "commit", "archive"]) {
  assert.equal(st.plan[key], true, `plan ${key} checked`)
}
for (let i = 0; i < 20; i++) ok()

// ---- applyCheck ----
st = createInitialState("my-change", "abc123")
st = applyCheck(st, "plan", "review-spec", true)
assert.equal(st.plan["review-spec"], true)
assert.throws(() => applyCheck(st, "plan", "nope", true), /unknown plan item/)
st = applyCheck(st, "task", "4.1", true, "implement the thing")
assert.equal(st.tasks.length, 1)
assert.equal(st.tasks[0].id, "4.1")
assert.equal(st.tasks[0].checked, true)
assert.equal(st.tasks[0].text, "implement the thing")
st = applyCheck(st, "task", "4.1", false)
assert.equal(st.tasks[0].checked, false)
st = applyCheck(st, "task", "4.2", true, "second task")
assert.equal(st.tasks.length, 2)
assert.throws(() => applyCheck(st, "task", "9.9", true), /no label/)
for (let i = 0; i < 9; i++) ok()

// ---- applyLog ----
st = createInitialState("my-change", "abc123")
const entry = newLogEntry("SPEC", "architect", "return", "done")
st = applyLog(st, entry)
assert.equal(st.log.length, 1)
assert.equal(st.log[0].phase, "SPEC")
assert.equal(st.log[0].actor, "architect")
assert.equal(st.log[0].event, "return")
assert.equal(st.log[0].result, "done")
assert.match(st.log[0].time, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
for (let i = 0; i < 6; i++) ok()

// ---- applyReview ----
st = createInitialState("my-change", "abc123")
st = applyReview(st, { gate: "spec", cycle: 1, verdict: "PASS", critical: 0, major: 1, report: ".autopilot/change-my-change/review-spec-1.md" })
assert.equal(st.reviews.length, 1)
assert.equal(st.reviews[0].gate, "spec")
assert.equal(st.reviews[0].verdict, "PASS")
assert.equal(st.reviews[0].critical, 0)
assert.equal(st.reviews[0].report, ".autopilot/change-my-change/review-spec-1.md")
st = applyReview(st, { gate: "spec", cycle: 1, verdict: "FAIL", critical: 2, major: 0, report: "r2.md" })
assert.equal(st.reviews.length, 1, "same gate+cycle updates row")
assert.equal(st.reviews[0].verdict, "FAIL")
st = applyReview(st, { gate: "code", cycle: 2, verdict: "PASS", critical: 0, major: 0, report: "r3.md" })
assert.equal(st.reviews.length, 2, "different gate+cycle appends")
assert.throws(() => applyReview(st, { gate: "bogus", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "x" }), /invalid gate/)
for (let i = 0; i < 7; i++) ok()

// ---- applyBlocker ----
st = createInitialState("my-change", "abc123")
st = applyBlocker(st, "litellm down")
assert.equal(st.blockers.length, 1)
assert.equal(st.blockers[0], "litellm down")
st = applyBlocker(st, "second blocker")
assert.equal(st.blockers.length, 2)
for (let i = 0; i < 3; i++) ok()

// ---- nextStep ----
st = createInitialState("my-change", "abc123")
let ns = nextStep(st)
assert.equal(ns.status, "SPEC")
assert.equal(ns.next, "dispatch architect for SPEC")
assert.equal(ns.dispatch, "architect")
assert.equal(ns.transition, "SPEC -> REVIEW-SPEC")
assert.deepEqual(ns.pending, [])
st = applyLog(st, newLogEntry("SPEC", "architect", "return", "done"))
ns = nextStep(st)
assert.equal(ns.dispatch, null)
assert.equal(ns.next, "transition to REVIEW-SPEC")
assert.equal(ns.transition, "SPEC -> REVIEW-SPEC")
st = applyTransition(st, "SPEC", "REVIEW-SPEC")
ns = nextStep(st)
assert.equal(ns.dispatch, "reviewer")
assert.equal(ns.next, "dispatch reviewer (target: spec, cycle 1)")
assert.equal(ns.transition, null)
st = applyReview(st, { gate: "spec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r.md" })
assert.equal(nextStep(st).transition, "REVIEW-SPEC -> SUBSPEC")
st = applyTransition(st, "REVIEW-SPEC", "SUBSPEC")
assert.equal(nextStep(st).dispatch, "designer")
st = applyLog(st, newLogEntry("SUBSPEC", "designer", "return", "done"))
assert.equal(nextStep(st).transition, "SUBSPEC -> REVIEW-SUBSPEC")
st = applyTransition(st, "SUBSPEC", "REVIEW-SUBSPEC")
assert.ok(nextStep(st).next.includes("cycle 1"), "subspec reviewer pending")
st = applyReview(st, { gate: "subspec", cycle: 1, verdict: "PASS", critical: 0, major: 0, report: "r2.md" })
st = applyTransition(st, "REVIEW-SUBSPEC", "APPLY")
st = applyCheck(st, "task", "2.1", false, "build endpoint")
ns = nextStep(st)
assert.equal(ns.dispatch, "impl-worker")
assert.ok(ns.next.startsWith("dispatch impl-worker for APPLY"), ns.next)
assert.deepEqual(ns.pending, ["2.1 build endpoint"])
assert.equal(ns.transition, null)
st = applyCheck(st, "task", "2.1", true)
assert.equal(nextStep(st).transition, "APPLY -> REVIEW-CODE")
st = applyTransition(st, "APPLY", "BLOCKED")
st = applyBlocker(st, "litellm down")
ns = nextStep(st)
assert.equal(ns.dispatch, null)
assert.ok(ns.next.includes("user"), ns.next)
assert.deepEqual(ns.pending, ["litellm down"])
st = applyTransition(st, "BLOCKED", "REVIEW-CODE")
let s2 = applyTransition(st, "REVIEW-CODE", "COMMIT")
assert.equal(nextStep(s2).next, "commit the change (stage the computed file set against base; user approves once)")
s2 = applyTransition(s2, "COMMIT", "ARCHIVE")
assert.equal(nextStep(s2).dispatch, null)
assert.equal(nextStep(s2).transition, "ARCHIVE -> DONE")
s2 = applyTransition(s2, "ARCHIVE", "DONE")
assert.equal(nextStep(s2).next, "change complete — nothing to do")
for (let i = 0; i < 22; i++) ok()

// ---- atomicWrite ----
const dir = mkdtempSync(join(tmpdir(), "autopilot-smoke-"))
try {
  const target = join(dir, "state.json")
  atomicWrite(target, serializeState(createInitialState("my-change", "abc123")))
  const onDisk = parseState(readFileSync(target, "utf8"))
  assert.equal(onDisk.status, "SPEC")
  assert.equal(onDisk.slug, "my-change")
  assert.ok(!readdirSync(dir).some((f) => f.includes(".tmp-")), "no tmp leftover")
} finally {
  rmSync(dir, { recursive: true, force: true })
}
for (let i = 0; i < 3; i++) ok()

console.log(`PASS (${count} assertions)`)