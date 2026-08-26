# Regenerates brand image assets from the bundled Fraunces font.
# Run after changing the wordmark, palette, or font files.
#   powershell -ExecutionPolicy Bypass -File scripts/make-brand-assets.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$fontPath = Join-Path $root "assets\fonts\Fraunces_600SemiBold.ttf"
$outDir = Join-Path $root "assets\images"

if (-not (Test-Path $fontPath)) { throw "Font not found: $fontPath" }

$pfc = New-Object System.Drawing.Text.PrivateFontCollection
$pfc.AddFontFile($fontPath)
$family = $pfc.Families[0]

$ink = [System.Drawing.Color]::FromArgb(255, 0x18, 0x18, 0x1B)
$paper = [System.Drawing.Color]::FromArgb(255, 0xFA, 0xFA, 0xFA)

$centerFormat = New-Object System.Drawing.StringFormat
$centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
$centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

# Measure text tightly at a reference size, then scale the font linearly.
function Get-SizedFont([string]$text, [double]$targetWidthPx) {
  $refSize = 100
  $refFont = New-Object System.Drawing.Font($family, $refSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $probe = New-Object System.Drawing.Bitmap(10, 10)
  $g = [System.Drawing.Graphics]::FromImage($probe)
  $size = $g.MeasureString($text, $refFont, [int]::MaxValue, $centerFormat)
  $g.Dispose(); $probe.Dispose(); $refFont.Dispose()
  $pixelSize = $refSize * ($targetWidthPx / $size.Width)
  return New-Object System.Drawing.Font($family, [float]$pixelSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-Mark([int]$size, [Nullable[System.Drawing.Color]]$background, [System.Drawing.Color]$textColor, [string]$text, [double]$widthRatio, [string]$outName) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  if ($background.HasValue) {
    $g.Clear($background.Value)
  } else {
    $g.Clear([System.Drawing.Color]::Transparent)
  }
  $font = Get-SizedFont $text ($size * $widthRatio)
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $brush = New-Object System.Drawing.SolidBrush($textColor)
  $g.DrawString($text, $font, $brush, $rect, $centerFormat)
  $brush.Dispose(); $font.Dispose(); $g.Dispose()
  $outPath = Join-Path $outDir $outName
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $outName"
}

# Launcher icon: ink tile, paper wordmark.
New-Mark 1024 $ink $paper "LifeOS" 0.74 "icon.png"
# Adaptive foreground: mark only, sized to survive the mask safe zone;
# the tile color comes from adaptiveIcon.backgroundColor in app.json.
New-Mark 1024 $null $paper "LifeOS" 0.52 "adaptive-icon.png"
# Splash: transparent, ink wordmark over the configured paper background.
New-Mark 2048 $null $ink "LifeOS" 0.46 "splash.png"
# Favicon: monogram stays legible at 64px.
New-Mark 64 $ink $paper "L" 0.62 "favicon.png"
