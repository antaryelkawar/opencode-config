import { Plugin } from "@opencode/plugin"
import { execFileSync } from "node:child_process"
import { accessSync, constants } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))

function onPath(name: string): string | null {
  try {
    const out =
      process.platform === "win32"
        ? execFileSync("where", [name], { stdio: ["ignore", "pipe", "ignore"] }).toString()
        : execFileSync("which", [name], { stdio: ["ignore", "pipe", "ignore"] }).toString()
    const first = out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0)
    return first ?? null
  } catch {
    return null
  }
}

function rtkPath(directory: string): string | null {
  const exe = process.platform === "win32" ? "rtk.exe" : "rtk"
  const found = onPath(exe)
  if (found) return found

  const candidates = [
    // Plugin lives in <config>/.opencode/plugins/rtk/index.ts; the binary is <config>/bin/rtk.
    join(HERE, "..", "..", "..", "bin", exe),
    // Project-local binary, as in the V1 plugin.
    join(directory, "bin", exe),
    // Shared config checked out inside the project.
    join(directory, "opencode-config", "bin", exe),
  ]

  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK)
      return candidate
    } catch {
      // try the next candidate
    }
  }

  return null
}

export default Plugin.define({
  id: "rtk",
  async setup(ctx) {
    const bin = rtkPath(ctx.location.directory)
    if (!bin) {
      console.warn("[rtk] rtk binary not found in PATH or ./bin — plugin disabled")
      return
    }

    await ctx.tool.hook("execute.before", (event) => {
      const tool = String(event.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return

      const input = event.input as Record<string, unknown> | undefined
      if (!input || typeof input !== "object") return

      const command = input.command
      if (typeof command !== "string" || !command) return

      try {
        const rewritten = execFileSync(bin, ["rewrite", command], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim()
        if (rewritten && rewritten !== command) input.command = rewritten
      } catch {
        // rtk rewrite failed — pass through unchanged
      }
    })
  },
})
