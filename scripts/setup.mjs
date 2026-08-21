#!/usr/bin/env node
// Cross-platform setup for opencode-config.
// Creates config links in the parent repo and provisions the rtk binary.
// Usage:
//   node scripts/setup.mjs               # create links + download rtk
//   node scripts/setup.mjs --remove      # remove created links
//   node scripts/setup.mjs --env-var-only  # print OPENCODE_CONFIG_DIR, no links
//   node scripts/setup.mjs --skip-rtk    # create links only, skip rtk download
//   node scripts/setup.mjs --force       # replace existing regular files without prompting
//   node scripts/setup.mjs --dry-run     # print what would change, make no changes

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const CONFIG_ROOT = resolve(SCRIPT_DIR, "..");
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const IS_WIN = process.platform === "win32";

// [target, link, isDir]
// All entries are single-source-of-truth links into the parent repo: edits to
// opencode-config are reflected live in every linked project.
const LINKS = [
  [join(CONFIG_ROOT, "opencode.jsonc"), join(REPO_ROOT, "opencode.jsonc"), false],
  [join(CONFIG_ROOT, "AGENTS.md"), join(REPO_ROOT, "AGENTS.md"), false],
  [join(CONFIG_ROOT, ".opencode"), join(REPO_ROOT, ".opencode"), true],
  [join(CONFIG_ROOT, ".agents"), join(REPO_ROOT, ".agents"), true],
  [join(CONFIG_ROOT, "docs", "agents"), join(REPO_ROOT, "docs", "agents"), true],
];

const args = process.argv.slice(2);
const DO_REMOVE = args.includes("--remove");
const ENV_VAR_ONLY = args.includes("--env-var-only");
const SKIP_RTK = args.includes("--skip-rtk");
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");

const log = (ok, msg) => console.log((ok ? "[OK] " : "[--] ") + msg);
const warn = (msg) => console.log("[!!] " + msg);

// ---- symlink / link helpers ----
function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}
function linkExists(p) {
  return existsSync(p) || isSymlink(p);
}
function isReparsePoint(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function confirm(msg) {
  if (FORCE) {
    log(false, "Assuming yes (--force): " + msg);
    return true;
  }
  if (DRY_RUN) return true;
  const readline = require("node:readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(msg + " [y/N] ", (a) => {
    rl.close();
    res(/^y(es)?$/i.test(a.trim()));
  }));
}

function backupFile(p) {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = p + ".bak-" + ts;
    renameSync(p, dest);
    log(true, "Backed up existing file: " + p + " -> " + dest);
    return true;
  } catch (e) {
    warn("Could not back up " + p + ": " + e.message);
    return false;
  }
}

// ============================================================
// Remove mode
// ============================================================
if (DO_REMOVE) {
  for (const [, link] of LINKS) {
    if (!linkExists(link)) {
      log(false, "Not found: " + link);
      continue;
    }
    try {
      if (IS_WIN && isReparsePoint(link)) {
        spawnSync("cmd", ["/c", "rmdir", link], { stdio: "ignore" });
      } else {
        rmSync(link, { force: true });
      }
      log(true, "Removed: " + link);
    } catch (e) {
      warn("Could not remove " + link + ": " + e.message);
    }
  }
  process.exit(0);
}

// ============================================================
// Env var only mode
// ============================================================
if (ENV_VAR_ONLY) {
  console.log("Set the following environment variable to use opencode-config directly:");
  console.log("");
  if (IS_WIN) {
    console.log("  $env:OPENCODE_CONFIG_DIR = '" + CONFIG_ROOT + "'");
    console.log("");
    console.log("Add it to your PowerShell $PROFILE to persist:");
    console.log("  Add-Content $PROFILE '$env:OPENCODE_CONFIG_DIR = \"" + CONFIG_ROOT + "\"'");
  } else {
    console.log("  export OPENCODE_CONFIG_DIR='" + CONFIG_ROOT + "'");
    console.log("");
    console.log("Add it to your shell profile to persist:");
    console.log("  echo 'export OPENCODE_CONFIG_DIR=\"" + CONFIG_ROOT + "\"' >> ~/.bashrc");
  }
  process.exit(0);
}

// ============================================================
// Create links
// ============================================================
function makeLink(target, link, isDir) {
  const ok = (kind) => {
    log(true, kind + ": " + link + " -> " + target);
    return true;
  };
  try {
    if (IS_WIN) {
      if (isDir) {
        // Junction first (no admin needed), then dir symlink
        let r = spawnSync("cmd", ["/c", "mklink", "J", link, target], { stdio: "pipe" });
        if (r.status === 0) return ok("Junction");
        r = spawnSync("cmd", ["/c", "mklink", "D", link, target], { stdio: "pipe" });
        if (r.status === 0) return ok("Symlink");
        warn("Failed to link " + link + ": " + (r.stderr?.toString() || ""));
        return false;
      }
      // File: symlink first, then hardlink
      let r = spawnSync("cmd", ["/c", "mklink", link, target], { stdio: "pipe" });
      if (r.status === 0) return ok("Symlink");
      r = spawnSync("cmd", ["/c", "mklink", "H", link, target], { stdio: "pipe" });
      if (r.status === 0) return ok("Hardlink");
      warn("Failed to link " + link + ": " + (r.stderr?.toString() || ""));
      return false;
    }
    // POSIX
    const r = spawnSync("ln", ["-s", target, link], { stdio: "pipe" });
    if (r.status === 0) return ok("Symlink");
    warn("Failed to link " + link + ": " + (r.stderr?.toString() || ""));
    return false;
  } catch (e) {
    warn("Failed to link " + link + ": " + e.message);
    return false;
  }
}

// Returns true when the link is in place (or already fine), false on failure.
async function ensureLink(target, link, isDir) {
  if (DRY_RUN) {
    if (linkExists(link)) {
      const alreadyLinked = isSymlink(link) || isReparsePoint(link);
      log(false, "[dry-run] " + link + " " + (alreadyLinked ? "is already a link — OK" : "exists as a real file — would back up + link"));
    } else {
      log(false, "[dry-run] Would link: " + link + " -> " + target);
    }
    return true;
  }

  if (isSymlink(link) || isReparsePoint(link)) {
    log(false, "Already a link: " + link);
    return true;
  }

  if (linkExists(link)) {
    // A real (non-link) file/dir is in the way. For a shared single source of
    // truth we must replace it with a link. Back it up first, with confirmation.
    const isFile = !isDir;
    const ok = await confirm(
      isFile
        ? `Replace existing file "${link}" with a link to opencode-config?`
        : `Replace existing directory "${link}" with a link to opencode-config?`
    );
    if (!ok) {
      warn("Skipping " + link + " (user declined)");
      return true;
    }
    if (!backupFile(link)) {
      warn("Aborting link for " + link + " (backup failed)");
      return false;
    }
    // For directories, rename may not remove the reparse point on some platforms;
    // belt-and-suspenders: also remove if still present.
    if (linkExists(link) && !isSymlink(link)) {
      try { rmSync(link, { recursive: true, force: true }); } catch { /* ignore */ }
    }
    return makeLink(target, link, isDir);
  }

  return makeLink(target, link, isDir);
}

let allOk = true;
for (const [target, link, isDir] of LINKS) {
  if (!(await ensureLink(target, link, isDir))) allOk = false;
}

// ============================================================
// PARENT_REPO_URL marker
// ============================================================
const markerFile = join(REPO_ROOT, "PARENT_REPO_URL");
if (existsSync(markerFile)) {
  log(false, "PARENT_REPO_URL marker already exists: " + markerFile);
} else {
  try {
    const remote = execFileSync("git", ["-C", REPO_ROOT, "remote", "get-url", "origin"], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    const m = remote.match(/github\.com[:/](.+)\.git$/);
    if (m) {
      writeFileSync(markerFile, m[1] + "\n");
      log(true, "Created PARENT_REPO_URL marker: " + markerFile);
    } else {
      warn("Could not determine git remote URL for parent repo");
    }
  } catch {
    warn("Could not determine git remote URL for parent repo");
  }
}

// ============================================================
// .scratch dir
// ============================================================
const scratchDir = join(REPO_ROOT, ".scratch");
if (existsSync(scratchDir)) {
  log(false, ".scratch directory already exists: " + scratchDir);
} else {
  mkdirSync(scratchDir, { recursive: true });
  log(true, "Created .scratch directory: " + scratchDir);
}

// ============================================================
// rtk provisioning
// ============================================================
if (!SKIP_RTK) {
  provisionRtk();
}

// ============================================================
// Summary
// ============================================================
console.log("");
if (allOk) {
  console.log("All config links are in place. OpenCode will pick up config from:");
  console.log("  " + CONFIG_ROOT);
} else {
  warn("Some links could not be created.");
  if (IS_WIN) {
    warn("Run as Administrator / enable Developer Mode, or use --env-var-only.");
  }
}

// ============================================================
// rtk download logic
// ============================================================
function rtkTarget() {
  const archMap = { x64: "x86_64", arm64: "aarch64" };
  const a = archMap[process.arch];
  if (!a) throw new Error("Unsupported CPU architecture: " + process.arch);
  if (IS_WIN) return { file: `rtk-${a}-pc-windows-msvc.zip`, ext: "zip" };
  if (process.platform === "darwin") return { file: `rtk-${a}-apple-darwin.tar.gz`, ext: "tar.gz" };
  // Linux: musl is static and most portable
  return { file: `rtk-${a}-unknown-linux-musl.tar.gz`, ext: "tar.gz" };
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function downloadBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed: " + res.status + " " + url);
  return Buffer.from(await res.arrayBuffer());
}

function findFileRecursive(dir, name) {
  const results = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name === name) results.push(full);
    }
  };
  walk(dir);
  return results[0] || null;
}

function extractArchive(archivePath, destDir, ext, exeName) {
  if (ext === "zip") {
    const tmpExtract = join(tmpdir(), "oc_rtk_extract_" + process.pid);
    mkdirSync(tmpExtract, { recursive: true });
    const r = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -Path '${archivePath}' -DestinationPath '${tmpExtract}' -Force`,
      ],
      { stdio: "pipe" }
    );
    if (r.status !== 0) throw new Error("Expand-Archive failed: " + (r.stderr?.toString() || ""));
    const found = findFileRecursive(tmpExtract, exeName);
    if (!found) throw new Error("Could not find " + exeName + " in zip archive");
    renameSync(found, join(destDir, exeName));
    rmSync(tmpExtract, { recursive: true, force: true });
    return;
  }
  // tar.gz
  const r = spawnSync("tar", ["-xzf", archivePath, "-C", destDir], { stdio: "pipe" });
  if (r.status !== 0) throw new Error("tar failed: " + (r.stderr?.toString() || ""));
  // tar extracts the binary as "rtk"; rename if our target name differs
  const extracted = join(destDir, "rtk");
  if (exeName !== "rtk" && existsSync(extracted)) {
    renameSync(extracted, join(destDir, exeName));
  }
}

async function provisionRtk() {
  const binDir = join(CONFIG_ROOT, "bin");
  const exeName = IS_WIN ? "rtk.exe" : "rtk";
  const destPath = join(binDir, exeName);

  if (existsSync(destPath)) {
    log(false, "rtk already present: " + destPath);
    return;
  }

  console.log("");
  console.log("Provisioning rtk binary...");
  try {
    const target = rtkTarget();

    const relRes = await fetch("https://api.github.com/repos/rtk-ai/rtk/releases/latest");
    if (!relRes.ok) throw new Error("GitHub API request failed: " + relRes.status);
    const release = await relRes.json();
    const tag = release.tag_name;

    // Find the asset. Release files are unversioned (e.g. rtk-x86_64-pc-windows-msvc.zip),
    // but some releases prefix the version. Try exact name first, then version-prefixed.
    let asset = release.assets.find((a) => a.name === target.file);
    if (!asset) {
      const verNum = tag.replace(/^v/, "");
      const verFile = target.file.replace(/^rtk-/, `rtk-${verNum}-`);
      asset = release.assets.find((a) => a.name === verFile);
    }
    if (!asset) throw new Error("rtk asset not found: " + target.file);

    const tmpArchive = join(tmpdir(), "oc_rtk_" + process.pid + "_" + asset.name);
    const buf = await downloadBuf(asset.browser_download_url);
    writeFileSync(tmpArchive, buf);

    // Verify checksum against checksums.txt
    try {
      const csRes = await fetch(
        "https://github.com/rtk-ai/rtk/releases/download/" + tag + "/checksums.txt"
      );
      if (csRes.ok) {
        const csText = await csRes.text();
        const line = csText.split("\n").find((l) => l.includes(asset.name));
        if (line) {
          const expected = line.trim().split(/\s+/)[0].toLowerCase();
          const actual = sha256(buf);
          if (expected !== actual) {
            throw new Error(
              "Checksum mismatch for " + asset.name + "\n  expected: " + expected + "\n  actual:   " + actual
            );
          }
          log(true, "Checksum verified for " + asset.name);
        } else {
          warn("No checksum entry for " + asset.name + " — skipping verification");
        }
      } else {
        warn("Could not fetch checksums.txt — skipping verification");
      }
    } catch (e) {
      if (e.message.startsWith("Checksum mismatch")) throw e;
      warn("Checksum verification skipped: " + e.message);
    }

    mkdirSync(binDir, { recursive: true });
    extractArchive(tmpArchive, binDir, target.ext, exeName);
    if (!IS_WIN) {
      try {
        chmodSync(destPath, 0o755);
      } catch {
        /* ignore */
      }
    }
    rmSync(tmpArchive, { force: true });
    log(true, "rtk installed: " + destPath + " (" + tag + ")");
  } catch (e) {
    warn("rtk provisioning failed: " + e.message);
    warn("Install rtk manually and place it at: " + destPath);
    warn("Or add rtk to your PATH and the plugin will use it automatically.");
  }
}
