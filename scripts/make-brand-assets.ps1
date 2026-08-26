# Regenerates brand image assets from the bento-grid logo.
# Run after changing the bento geometry or palette:
#   powershell -ExecutionPolicy Bypass -File scripts/make-brand-assets.ps1
#   or: python scripts/bento-grid.py && python scripts/promote-bento.py

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Generating bento-grid logo (1024/512/256)..."
python scripts/bento-grid.py
if ($LASTEXITCODE -ne 0) { throw "bento-grid.py failed" }

Write-Host "Promoting to app assets (icon, adaptive-icon, splash, favicon)..."
python scripts/promote-bento.py
if ($LASTEXITCODE -ne 0) { throw "promote-bento.py failed" }

Write-Host "Brand assets ready:"
Get-ChildItem assets/images/icon.png, assets/images/adaptive-icon.png, assets/images/splash.png, assets/images/favicon.png | Format-Table Name, Length
