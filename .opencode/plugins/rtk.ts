import type { Plugin } from "@opencode-ai/plugin"
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

// Resolve the rtk binary: prefer PATH, fall back to the repo-local bin/rtk.exe.
function rtkPath(directory: string): string | null {
  const isWin = process.platform === "win32"
  const exe = isWin ? "rtk.exe" : "rtk"

  try {
    const found = isWin
      ? execSync(`where rtk 2>nul`, { stdio: ["ignore", "pipe", "ignore"] })
          .toString()
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.length > 0)
      : execSync(`command -v rtk 2>/dev/null`, { stdio: ["ignore", "pipe", "ignore"] })
          .toString()
          .trim()
    if (found) return found
  } catch {
    // not on PATH — try repo-local
  }

  const local = join(directory, "bin", exe)
  if (existsSync(local)) return local

  return null
}

export const RtkOpenCodePlugin: Plugin = async ({ $, directory }) => {
  const bin = rtkPath(directory)
  if (!bin) {
    console.warn("[rtk] rtk binary not found in PATH or ./bin — plugin disabled")
    return {}
  }

  return {
    "tool.execute.before": async (input, output) => {
      const tool = String(input?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return
      const args = output?.args
      if (!args || typeof args !== "object") return

      const command = (args as Record<string, unknown>).command
      if (typeof command !== "string" || !command) return

      try {
        const result = await $`${bin} rewrite ${command}`.quiet().nothrow()
        const rewritten = String(result.stdout).trim()
        if (rewritten && rewritten !== command) {
          ;(args as Record<string, unknown>).command = rewritten
        }
      } catch {
        // rtk rewrite failed — pass through unchanged
      }
    },
  }
}
