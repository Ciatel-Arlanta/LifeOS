# Local release APK for sideloading.
# Requires Android Studio (or JDK 17+ and the Android SDK).

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  $studioJbr = "C:\Program Files\Android\Android Studio\jbr"
  if (Test-Path "$studioJbr\bin\java.exe") {
    $env:JAVA_HOME = $studioJbr
  } else {
    throw "JAVA_HOME is not set and Android Studio JBR was not found."
  }
}

if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
  $sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
  if (Test-Path $sdk) {
    $env:ANDROID_HOME = $sdk
  } else {
    throw "ANDROID_HOME is not set and $sdk was not found."
  }
}

$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:CI = "1"

Write-Host "Generating android/ with expo prebuild"
bunx expo prebuild --platform android
if ($LASTEXITCODE -ne 0) { throw "expo prebuild failed." }

# expo prebuild rewrites these to `expo run:*`. Keep the documented start scripts.
$pkgPath = Join-Path $root "package.json"
$pkgJson = Get-Content $pkgPath -Raw
$pkgJson = $pkgJson -replace '"android": "expo run:android"', '"android": "expo start --android"'
$pkgJson = $pkgJson -replace '"ios": "expo run:ios"', '"ios": "expo start --ios"'
Set-Content -Path $pkgPath -Value $pkgJson -NoNewline

# Gesture-handler codegen object names exceed 260 chars if the package lives
# under this repo path. Copy it to C:\g and junction it back so CMake
# canonicalizes to the short path.
$ghSrc = Join-Path $root "node_modules\react-native-gesture-handler"
$ghDst = "C:\g"
if ((Test-Path $ghSrc) -and -not ((Get-Item $ghSrc).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
  if (Test-Path $ghDst) { Remove-Item -Recurse -Force $ghDst }
  New-Item -ItemType Directory -Force -Path $ghDst | Out-Null
  robocopy $ghSrc $ghDst /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
  cmd /c "rmdir /S /Q `"$ghSrc`""
  cmd /c "mklink /J `"$ghSrc`" `"$ghDst`""
}

# Keep Ninja object paths under Windows' 260-char limit.
$appGradle = Join-Path $root "android\app\build.gradle"
$gradleText = Get-Content $appGradle -Raw
if ($gradleText -notmatch 'buildStagingDirectory "C:/c"') {
  $gradleText = $gradleText -replace '(compileSdk rootProject\.ext\.compileSdkVersion\r?\n)', "`$1`n    externalNativeBuild { cmake { buildStagingDirectory `"C:/c`" } }`n"
  Set-Content -Path $appGradle -Value $gradleText -NoNewline
}

# Prefer an already-installed build-tools package. Expo 56 asks for 36.0.0,
# which can fail to download as a corrupt zip.
$gradleProps = Join-Path $root "android\gradle.properties"
if (Test-Path $gradleProps) {
  $props = Get-Content $gradleProps -Raw
  if ($props -notmatch "android.buildToolsVersion") {
    Add-Content $gradleProps "`nandroid.buildToolsVersion=36.1.0`n"
  }
  $props = Get-Content $gradleProps -Raw
  $props = $props -replace "reactNativeArchitectures=.*", "reactNativeArchitectures=arm64-v8a"
  Set-Content $gradleProps $props
}

# Gradle 9 removed JvmVendorSpec.IBM_SEMERU. React Native 0.85 still pins
# foojay-resolver 0.5.0, which references that field during settings eval.
$foojay = Join-Path $root "node_modules\@react-native\gradle-plugin\settings.gradle.kts"
if (Test-Path $foojay) {
  $text = Get-Content $foojay -Raw
  $updated = $text -replace 'foojay-resolver-convention"\)\.version\("0\.5\.0"\)', 'foojay-resolver-convention").version("1.0.0")'
  if ($updated -ne $text) {
    Set-Content -Path $foojay -Value $updated -NoNewline
    Write-Host "Patched foojay-resolver-convention to 1.0.0 for Gradle 9"
  }
}

Write-Host "Building release APK"
Set-Location (Join-Path $root "android")
.\gradlew.bat assembleRelease --no-daemon
if ($LASTEXITCODE -ne 0) { throw "gradlew assembleRelease failed." }

$apkCandidates = @(
  "C:\b\lifeos-app\outputs\apk\release\app-release.apk",
  (Join-Path $root "android\app\build\outputs\apk\release\app-release.apk")
)
$apk = $apkCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $apk) { throw "APK not found. Looked in: $($apkCandidates -join ', ')" }

$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
$pkg = Get-Content (Join-Path $root "package.json") -Raw | ConvertFrom-Json
$dest = Join-Path $dist "LifeOS-$($pkg.version).apk"
Copy-Item -Force $apk $dest

Write-Host "APK ready: $dest"
