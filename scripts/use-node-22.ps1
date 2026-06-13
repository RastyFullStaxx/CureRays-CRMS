$NodeVersion = '22.14.0'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$NodeHome = Join-Path $ProjectRoot ".tools\node-v$NodeVersion-win-x64"

if (!(Test-Path (Join-Path $NodeHome 'node.exe'))) {
  throw "Node.js $NodeVersion is not installed at $NodeHome"
}

$env:PATH = "$NodeHome;$env:PATH"

function global:node {
  & (Join-Path $NodeHome 'node.exe') @args
}

function global:npm {
  & (Join-Path $NodeHome 'npm.cmd') @args
}

function global:npx {
  & (Join-Path $NodeHome 'npx.cmd') @args
}

Write-Host "Using Node.js $NodeVersion from $NodeHome"
Write-Host "Run: node -v"
