<#
.SYNOPSIS
    Cross-platform setup for opencode-config (Windows entry point).
.DESCRIPTION
    Thin wrapper around scripts/setup.mjs. Creates config links in the parent
    repo and provisions the rtk binary. Requires Node.js.
.PARAMETER Remove
    Remove existing links instead of creating them.
.PARAMETER EnvVarOnly
    Don't create filesystem links; just print the OPENCODE_CONFIG_DIR instruction.
.PARAMETER SkipRtk
    Create links only, skip the rtk download.
.EXAMPLE
    .\setup.ps1
    .\setup.ps1 -Remove
    .\setup.ps1 -EnvVarOnly
    .\setup.ps1 -SkipRtk
#>
param([switch]$Remove, [switch]$EnvVarOnly, [switch]$SkipRtk)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $PSCommandPath
$SetupMjs = Join-Path $ScriptDir "setup.mjs"

$nodeArgs = @()
if ($Remove) { $nodeArgs += "--remove" }
if ($EnvVarOnly) { $nodeArgs += "--env-var-only" }
if ($SkipRtk) { $nodeArgs += "--skip-rtk" }

# Prefer node, fall back to fnm/nvm-managed node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "Node.js is required to run setup. Install it from https://nodejs.org"
    exit 1
}

& $node.Source $SetupMjs @nodeArgs
exit $LASTEXITCODE
