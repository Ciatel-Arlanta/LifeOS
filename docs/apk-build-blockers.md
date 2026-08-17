# APK build — issues and blockers

Stopped further build work on request. This is what happened on this Windows machine while producing a sideload APK.

**Outcome:** a release APK did finish. File: `dist/LifeOS-0.1.0.apk` (~47 MB, arm64-v8a, debug-signed). Do not keep iterating on the build unless something about that file is wrong.

---

## Blockers that actually failed a build

### 1. No Java on PATH, no `ANDROID_HOME`

Android Studio is installed, but `java` is not on PATH and the SDK env vars are unset.

**Workaround used:** Android Studio JBR at `C:\Program Files\Android\Android Studio\jbr` and SDK at `%LOCALAPPDATA%\Android\Sdk`. `scripts/build-apk.ps1` sets these if missing.

### 2. Gradle 9.3.1 + foojay-resolver 0.5.0

Expo prebuild pulled Gradle 9.3.1. React Native 0.85 still pins `org.gradle.toolchains.foojay-resolver-convention` 0.5.0, which references `JvmVendorSpec.IBM_SEMERU`. That field is gone in Gradle 9.

```
Class org.gradle.jvm.toolchain.JvmVendorSpec does not have member field
'org.gradle.jvm.toolchain.JvmVendorSpec IBM_SEMERU'
```

**Workaround used:** after prebuild, patch `node_modules/@react-native/gradle-plugin/settings.gradle.kts` to foojay 1.0.0. This is wiped by `bun install` / a clean `node_modules`.

### 3. Android SDK Build-Tools 36.0.0 download was corrupt

Expo 56 asked for `build-tools;36.0.0`. Gradle downloaded a non-ZIP and left a broken `build-tools/36.0.0/.installer` folder.

```
ZipException: Archive is not a ZIP archive
Failed to install the following SDK components: build-tools;36.0.0
```

**Workaround used:** delete the broken folder; pin `android.buildToolsVersion=36.1.0` (already installed).

### 4. Windows 260-character Ninja path limit (main blocker)

First real compile got to ~91% then died in CMake/Ninja:

```
ninja: error: Stat(.../rngesturehandler_codegen/.../RNGestureHandlerDetectorShadowNode.cpp.o):
Filename longer than 260 characters
```

This repo path is already long (`C:\Files\Code_Database\Projects\Personal\LifeOS`). React Native Gesture Handler codegen embeds the full source path in the object filename. Ninja 1.10 shipped with Android CMake 3.22.1 hard-fails over 260 chars.

Things that **did not** fix it:

| Attempt | Why it failed |
|---|---|
| `subst L:` to the project | `expo-modules-autolinking` cannot find `package.json` at a drive root (`L:\`) |
| Junction `C:\los` → this repo | CMake/autolinking resolve the junction back to the long real path |
| Full `robocopy` of the repo to `C:\los` | First pass excluded every `dist/` and `build/` folder, so `uuid`, `hermes-parser`, and `expo-modules-autolinking` were incomplete |
| Only junction `react-native-gesture-handler` → `C:\g` | CMake still compiled via the long `node_modules\...` path |
| `layout.buildDirectory = C:/b/lifeos-app` | Moved JS/Java outputs, **not** `.cxx`. Ninja still wrote under `android/app/.cxx` |

What finally worked:

1. Copy gesture-handler to a real short folder `C:\g`.
2. Point `react-native.config.js` at `C:\g` when that folder exists.
3. Set CMake `buildStagingDirectory` to `C:\c`.
4. Build only `arm64-v8a`.

Those helpers (`C:\g`, `C:\c`, `C:\b`) are machine-local. They are not part of the app.

### 5. No Expo login (EAS cloud unused)

`bunx expo whoami` → not logged in. Cloud `eas build` was documented in the README but not run. Local Gradle was the only way to get a file on disk this session.

---

## Friction (not fatal, but slow)

- First Gradle run downloaded Gradle 9.3.1, an Adoptium JDK 17 toolchain, NDK 27.1.12297006, and many Maven artifacts. That alone was tens of minutes.
- Expo prebuild rewrites `package.json` scripts to `expo run:android` / `expo run:ios`. The build script puts `expo start --android` back.
- `layout.buildDirectory` left the APK at `C:\b\lifeos-app\outputs\apk\release\app-release.apk`. It was copied to `dist/LifeOS-0.1.0.apk`.
- Debug-signed release only. Fine for personal sideload. A new debug keystore later means uninstall before update.
- arm64-only APK. Will not run on an x86 emulator.

---

## Leftover machine state

Safe to delete later if you want the disk back:

- `C:\los` — incomplete/abandoned full copy of the repo
- `C:\g` — short copy of `react-native-gesture-handler` (needed again for `bun run build:apk`)
- `C:\c` — CMake staging
- `C:\b\lifeos-app` — Gradle app outputs (includes the raw `app-release.apk`)
- `android/` in the repo — generated, gitignored
- `credentials/` — unused keystore from an earlier signing attempt

---

## If a rebuild fails again

1. Confirm `dist/LifeOS-0.1.0.apk` is still there before spending another hour.
2. Do not retry `subst` or a junction of the whole repo.
3. Keep `C:\g` + `react-native.config.js` + `buildStagingDirectory "C:/c"`.
4. After `bun install`, re-apply the foojay 1.0.0 patch (the build script does this).
5. Optional escape hatch: `bunx eas-cli login` then `bunx eas-cli build -p android --profile preview` (needs an Expo account). That avoids local Ninja path limits entirely.
