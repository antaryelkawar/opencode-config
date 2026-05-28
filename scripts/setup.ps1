<#
.SYNOPSIS
    Sets up opencode config from the opencode-config submodule into the parent repo.
.DESCRIPTION
    Creates symlinks/junctions for opencode.json and .opencode/ in the parent repo
    root, pointing at corresponding files inside the opencode-config submodule.
    Falls back to hardlink/junction if symlinks aren't available (non-admin).
    Use -Remove to tear down existing links.
.PARAMETER Remove
    Remove existing links instead of creating them.
.PARAMETER EnvVarOnly
    Don't create filesystem links; just print the OPENCODE_CONFIG_DIR instruction.
.EXAMPLE
    .\setup.ps1
    .\setup.ps1 -Remove
    .\setup.ps1 -EnvVarOnly
#>

param([switch]$Remove, [switch]$EnvVarOnly)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSCommandPath
$ConfigRoot = Resolve-Path "$ScriptDir\.."
$RepoRoot = Resolve-Path "$ScriptDir\..\.."

$Items = @(
    @{ Target = "$ConfigRoot\opencode.json"; Link = "$RepoRoot\opencode.json"; Type = "file" }
    @{ Target = "$ConfigRoot\.opencode";    Link = "$RepoRoot\.opencode";    Type = "dir"  }
)

# ---- Remove ----
if ($Remove) {
    foreach ($item in $Items) {
        if (-not (Test-Path $item.Link)) {
            Write-Host "[--] Not found: $($item.Link)"
            continue
        }
        $linkItem = Get-Item $item.Link -Force -ErrorAction SilentlyContinue
        $isReparse = $linkItem -and ($linkItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)
        if ($isReparse -and $item.Type -eq "dir") {
            cmd /c rmdir "$($item.Link)" 2>$null
        } else {
            Remove-Item -Force $item.Link
        }
        if (-not (Test-Path $item.Link)) {
            Write-Host "[OK] Removed: $($item.Link)"
        } else {
            Write-Warning "[!!] Could not remove: $($item.Link)"
        }
    }
    return
}

# ---- Env var only ----
if ($EnvVarOnly) {
    Write-Host "Set the following environment variable to use opencode-config directly:"
    Write-Host ""
    Write-Host "  `$env:OPENCODE_CONFIG_DIR = '$ConfigRoot'"
    Write-Host ""
    Write-Host "Add it to your PowerShell `$PROFILE to persist:"
    Write-Host "  Add-Content `$PROFILE '`$env:OPENCODE_CONFIG_DIR = ""$ConfigRoot""'"
    return
}

# ---- Test capabilities ----
function Test-Capability($type, $isDir) {
    try {
        $tmp = Join-Path $env:TEMP "oc_test_$([System.IO.Path]::GetRandomFileName())"
        if ($isDir) {
            $tmpTarget = Join-Path $env:TEMP "oc_test_dir_target_$([System.IO.Path]::GetRandomFileName())"
            New-Item -ItemType Directory -Path $tmpTarget -Force -ErrorAction Stop | Out-Null
            New-Item -ItemType $type -Path $tmp -Target $tmpTarget -Force -ErrorAction Stop | Out-Null
        } else {
            $tmpTarget = Join-Path $env:TEMP "oc_test_file_target_$([System.IO.Path]::GetRandomFileName())"
            New-Item -ItemType File -Path $tmpTarget -Force -ErrorAction Stop | Out-Null
            New-Item -ItemType $type -Path $tmp -Target $tmpTarget -Force -ErrorAction Stop | Out-Null
        }
        Remove-Item -Force $tmp, $tmpTarget -ErrorAction SilentlyContinue | Out-Null
        return $true
    } catch {
        Remove-Item -Force $tmp, $tmpTarget -ErrorAction SilentlyContinue | Out-Null
        return $false
    }
}

$canSymlinkFile = Test-Capability "SymbolicLink" $false
$canSymlinkDir  = Test-Capability "SymbolicLink" $true
$canJunction    = Test-Capability "Junction"     $true
$canHardlink    = Test-Capability "HardLink"     $false

# ---- Determine best link type per item ----
$linkTypeFor = @{}
foreach ($item in $Items) {
    if ($item.Type -eq "dir" -and $canSymlinkDir) {
        $linkTypeFor[$item.Link] = "SymbolicLink"
    } elseif ($item.Type -eq "file" -and $canSymlinkFile) {
        $linkTypeFor[$item.Link] = "SymbolicLink"
    } elseif ($item.Type -eq "dir" -and $canJunction) {
        $linkTypeFor[$item.Link] = "Junction"
    } elseif ($item.Type -eq "file" -and $canHardlink) {
        $linkTypeFor[$item.Link] = "HardLink"
    } else {
        $linkTypeFor[$item.Link] = $null
    }
}

# ---- Create links ----
foreach ($item in $Items) {
    if (Test-Path $item.Link) {
        Write-Host "[--] Already exists: $($item.Link)"
        continue
    }

    $type = $linkTypeFor[$item.Link]
    if (-not $type) {
        Write-Warning "[!!] No viable link method for: $($item.Link) ($($item.Type))"
        continue
    }

    try {
        if ($type -eq "Junction") {
            New-Item -ItemType Junction -Path $item.Link -Target $item.Target -Force -ErrorAction Stop | Out-Null
        } else {
            New-Item -ItemType $type -Path $item.Link -Target $item.Target -Force -ErrorAction Stop | Out-Null
        }
        Write-Host "[OK] $type`: $($item.Link) -> $($item.Target)"
    } catch {
        Write-Warning "[!!] Failed $type for: $($item.Link) -- $($_.Exception.Message)"
    }
}

# ---- Summary ----
$allOk = ($Items | ForEach-Object { Test-Path $_.Link }) -notcontains $false
if ($allOk) {
    Write-Host ""
    Write-Host "All config links are in place. OpenCode will pick up config from:"
    Write-Host "  $ConfigRoot"
} else {
    Write-Host ""
    Write-Warning "Some links could not be created."
    Write-Warning "Either run as Administrator / enable Developer Mode, or use -EnvVarOnly."
}
