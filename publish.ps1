#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Publish the read-aloud plugin: verify, commit, and push.

.DESCRIPTION
    One command for "upload this to the repo". It validates the package before
    pushing so a broken bundle never reaches GitHub, commits with the message
    you pass, and pushes to main.

.PARAMETER Message
    Commit message. Omit to publish without a commit (useful when only pushing
    an existing commit).

.PARAMETER SkipVerify
    Push without running the checks. Only for docs-only changes.

.EXAMPLE
    ./publish.ps1 -Message "feat: add English README"
#>
param(
    [string]$Message,
    [switch]$SkipVerify
)

$ErrorActionPreference = 'Stop'

$Git      = 'C:\Program Files\Git\cmd\git.exe'
$Repo     = 'C:\Users\Wen\dsh-plugins\dsh-client-ui-read-aloud'
$Checks   = 'C:\Users\Wen\Documents\deepseek-harness\default-workspace'
$Node     = 'C:\Users\Wen\.workbuddy-ai\binaries\node\versions\22.22.2-6\node.exe'
$Remote   = 'https://github.com/w13274161555-ops/dsh-client-ui-read-aloud.git'

if (-not (Test-Path $Git))  { throw "git not found at $Git" }
if (-not (Test-Path $Repo)) { throw "repo not found at $Repo" }

if (-not $SkipVerify) {
    Write-Host '=== verifying package ===' -ForegroundColor Cyan
    $suites = @('check-bundle.mjs', 'check-fresh-install.mjs', 'check-icon-size.mjs', 'test-rate-host.mjs')
    foreach ($suite in $suites) {
        $path = Join-Path $Checks $suite
        if (-not (Test-Path $path)) { Write-Host "skip $suite (missing)" -ForegroundColor Yellow; continue }
        $output = & $Node $path 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host $output
            throw "check failed: $suite"
        }
        Write-Host "  ok  $suite" -ForegroundColor Green
    }
}

$status = & $Git -C $Repo status --porcelain
if ([string]::IsNullOrWhiteSpace($status) -and [string]::IsNullOrWhiteSpace($Message)) {
    Write-Host 'Nothing to publish: working tree clean and no message given.' -ForegroundColor Yellow
    exit 0
}

if (-not [string]::IsNullOrWhiteSpace($Message)) {
    & $Git -C $Repo add -A
    & $Git -C $Repo commit -q -m $Message
    if ($LASTEXITCODE -ne 0) { throw 'commit failed' }
    Write-Host "committed: $Message" -ForegroundColor Green
}

$env:GIT_TERMINAL_PROMPT = '0'
# git writes progress to stderr; merge it so PowerShell does not treat a
# successful push as a failed command.
& $Git -C $Repo push $Remote main:main 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { throw 'push failed' }

Write-Host ''
Write-Host 'published to https://github.com/w13274161555-ops/dsh-client-ui-read-aloud' -ForegroundColor Green
& $Git -C $Repo log --oneline -3
