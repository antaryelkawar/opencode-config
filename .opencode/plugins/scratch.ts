import type { Plugin } from "@opencode-ai/plugin"
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
    const p = join(directory, dir)
    if (!existsSync(p)) mkdirSync(p, { recursive: true })
  }
}

function ensureGitignore(directory: string): void {
  const p = join(directory, ".gitignore")
  const marker = "managed by scratch plugin"
  if (existsSync(p)) {
    const existing = readFileSync(p, "utf8")
    if (existing.includes(marker)) return
    writeFileSync(p, existing.replace(/\s+$/, "") + "\n" + GITIGNORE_BLOCK, "utf8")
  } else {
    writeFileSync(p, GITIGNORE_BLOCK, "utf8")
  }
}

export const ScratchPlugin: Plugin = async ({ directory }) => {
  try {
    ensureScratch(directory)
    ensureGitignore(directory)
  } catch (e) {
    console.warn("[scratch] setup failed:", e)
  }
  return {}
}
