import { Plugin } from "@opencode/plugin"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const SCRATCH_DIRS = [".tmp", ".autopilot"]
const GITIGNORE_BLOCK = `# opencode scratch (managed by scratch plugin — do not edit)
/tmp/
/.tmp/
/.autopilot/
`

function ensureScratch(directory: string): void {
  for (const dir of SCRATCH_DIRS) {
    const path = join(directory, dir)
    if (!existsSync(path)) mkdirSync(path, { recursive: true })
  }
}

function ensureGitignore(directory: string): void {
  const path = join(directory, ".gitignore")
  const marker = "managed by scratch plugin"
  if (existsSync(path)) {
    const existing = readFileSync(path, "utf8")
    if (existing.includes(marker)) return
    writeFileSync(path, existing.replace(/\s+$/, "") + "\n" + GITIGNORE_BLOCK, "utf8")
  } else {
    writeFileSync(path, GITIGNORE_BLOCK, "utf8")
  }
}

export default Plugin.define({
  id: "scratch",
  setup(ctx) {
    try {
      ensureScratch(ctx.location.directory)
      ensureGitignore(ctx.location.directory)
    } catch (error) {
      console.warn("[scratch] setup failed:", error)
    }
  },
})
